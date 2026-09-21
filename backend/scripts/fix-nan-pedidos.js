import pg from 'pg';

// Host direto do VPS (easypanel.ioshuavps.com.br aponta para Cloudflare e a porta 2777 timeout)
const connectionString =
  'postgres://ioshua:81ioshua29@169.58.232.73:2777/sistema-restaurante?sslmode=disable';

const NAMES = ['Eugenia', 'Shirleide', 'Ana Cristina'];

function toMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    const configRes = await client.query(`SELECT "taxaEntrega" FROM config ORDER BY id ASC LIMIT 1`);
    const taxaEntregaConfig = toMoney(configRes.rows[0]?.taxaEntrega);
    console.log('Taxa entrega (config):', taxaEntregaConfig);

    const pedidosRes = await client.query(
      `
      SELECT id, "numeroDiario", "nomeCliente", "valorTotalPedido", "isRetiradaEstabelecimento", "createdAt"
      FROM pedidos
      WHERE "nomeCliente" ILIKE ANY ($1::text[])
      ORDER BY id DESC
      LIMIT 10
      `,
      [NAMES.map((n) => `%${n}%`)]
    );

    if (pedidosRes.rows.length === 0) {
      console.log('Nenhum pedido encontrado para esses nomes.');
      return;
    }

    console.log('\nPedidos encontrados:');
    for (const p of pedidosRes.rows) {
      console.log(
        `#${p.id} | ${p.nomeCliente} | valor=${p.valorTotalPedido} | retirada=${p.isRetiradaEstabelecimento} | ${p.createdAt}`
      );
    }

    // Prefer the latest order per target name (the "últimos 3")
    const selected = [];
    for (const name of NAMES) {
      const match = pedidosRes.rows.find((p) =>
        String(p.nomeCliente).toLowerCase().includes(name.toLowerCase())
      );
      if (match) selected.push(match);
    }

    // Fallback: if pattern matching missed, take first 3 rows
    const targets = selected.length ? selected : pedidosRes.rows.slice(0, 3);

    console.log('\n--- Recálculo ---');

    await client.query('BEGIN');

    for (const pedido of targets) {
      const itensRes = await client.query(
        `
        SELECT
          ip.id,
          ip."produtoId",
          ip.quantidade,
          ip."precoUnitario",
          p."nomeProduto",
          p."valorProduto"
        FROM itenspedidos ip
        LEFT JOIN produtos p ON p.id = ip."produtoId"
        WHERE ip."pedidoId" = $1
        ORDER BY ip.id
        `,
        [pedido.id]
      );

      let subtotalItens = 0;
      const detalhe = [];

      for (const item of itensRes.rows) {
        // Prefer snapshot price on item; fallback to current product price
        let precoUnit = toMoney(item.precoUnitario);
        if (!Number.isFinite(Number(item.precoUnitario)) || Number(item.precoUnitario) === 0) {
          // If stored as NaN/invalid, use product price
          const fromProduto = toMoney(item.valorProduto);
          if (fromProduto > 0) precoUnit = fromProduto;
        }
        // Explicit NaN string / invalid check
        if (!Number.isFinite(precoUnit) || String(item.precoUnitario).toLowerCase() === 'nan') {
          precoUnit = toMoney(item.valorProduto);
        }

        const qtd = toMoney(item.quantidade) || 1;
        let itemTotal = precoUnit * qtd;

        const subsRes = await client.query(
          `
          SELECT
            sip.id,
            sip."subProdutoId",
            sip.quantidade,
            sip."precoAdicional",
            sp."nomeSubProduto",
            sp."valorAdicional"
          FROM subitempedido sip
          LEFT JOIN subprodutos sp ON sp.id = sip."subProdutoId"
          WHERE sip."itemPedidoId" = $1
          ORDER BY sip.id
          `,
          [item.id]
        );

        let subsTotal = 0;
        for (const sub of subsRes.rows) {
          let precoSub = toMoney(sub.precoAdicional);
          if (!Number.isFinite(Number(sub.precoAdicional)) || String(sub.precoAdicional).toLowerCase() === 'nan') {
            precoSub = toMoney(sub.valorAdicional);
          }
          const qtdSub = toMoney(sub.quantidade) || 1;
          const line = precoSub * qtdSub;
          subsTotal += line;

          // Fix snapshot on subitem if needed
          if (String(sub.precoAdicional).toLowerCase() === 'nan' || !Number.isFinite(Number(sub.precoAdicional))) {
            await client.query(`UPDATE subitempedido SET "precoAdicional" = $1 WHERE id = $2`, [
              precoSub,
              sub.id,
            ]);
          }
        }

        itemTotal += subsTotal;
        subtotalItens += itemTotal;

        // Fix snapshot on item if needed
        if (String(item.precoUnitario).toLowerCase() === 'nan' || !Number.isFinite(Number(item.precoUnitario))) {
          await client.query(`UPDATE itenspedidos SET "precoUnitario" = $1 WHERE id = $2`, [
            precoUnit,
            item.id,
          ]);
        }

        detalhe.push({
          produto: item.nomeProduto,
          qtd,
          precoUnit,
          subs: subsRes.rows.length,
          subsTotal,
          itemTotal,
        });
      }

      const taxa = pedido.isRetiradaEstabelecimento ? 0 : taxaEntregaConfig;
      const novoTotal = Number((subtotalItens + taxa).toFixed(2));

      console.log(`\nPedido #${pedido.id} (${pedido.nomeCliente})`);
      console.log('  Itens:', JSON.stringify(detalhe, null, 2));
      console.log(`  Subtotal itens: ${subtotalItens.toFixed(2)}`);
      console.log(`  Taxa entrega: ${taxa.toFixed(2)} (retirada=${pedido.isRetiradaEstabelecimento})`);
      console.log(`  Valor antigo: ${pedido.valorTotalPedido}`);
      console.log(`  Valor novo: ${novoTotal.toFixed(2)}`);

      await client.query(`UPDATE pedidos SET "valorTotalPedido" = $1, "updatedAt" = NOW() WHERE id = $2`, [
        novoTotal,
        pedido.id,
      ]);
    }

    await client.query('COMMIT');
    console.log('\nAtualização concluída com sucesso.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Erro:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
