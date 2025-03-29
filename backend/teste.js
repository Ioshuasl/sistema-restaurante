const user = {
    id: 3,
    username: "lucas",
    isAdmin: false
}

function isAdmin(user) {
    if (user.isAdmin === true) {
        console.log(user.isAdmin)
        return user.isAdmin
    } else {
        console.log("Você não tem permissão para usar essa função")
    }
}

isAdmin(user)