const express = require('express');
const router = express.Router();
const User = require('../models/user');


router.get("/add", (req, res) => {
    const testUser = {
        username: "Test User",
        transactions: [
            { "payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z" },
            { "payer": "UNILEVER", "points": 200, "timestamp": "2022-10-31T11:00:00Z" },
            { "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T15:00:00Z" },
            { "payer": "MILLER COORS", "points": 10000, "timestamp": "2022-11-01T14:00:00Z" },
            { "payer": "DANNON", "points": 1000, "timestamp": "2022-11-02T14:00:00Z" }
        ]
    }

    User.deleteMany({})
        .then(deletedUser => {
            console.log('this is what remove returns', deletedUser)
            User.create(testUser)
                .then((data) => {
                    console.log('Here are the new seed data', data)
                    res.json(data.transactions)
                })
                .catch(error => {
                    console.log(error)
                })
        })
})





router.get("/balance", (req, res) => {
    User.findOne({})
        .then((user) => {
            let total = totalPoints(user)
            let dictionary = balance(user)
            totalBalance = [{ Total_Points: total }, dictionary]
            res.json(totalBalance)
        })
        .catch((error) => {
            console.log(error)
        })
})



router.get("/spend/:id", (req, res) => {
    let amount = Number(req.params.id)
    User.findOne({}).then((user) => {

        let transactions = user.transactions
        let spendCall = []
        if (totalPoints(user) < amount) {
            res.json({ message: "Not enough points" })
            return false
        }
        else {
            while (amount > 0) {
                for (let i = 0; i < transactions.length; i++) {
                    
                    if (transactions[i].points > 0) {
                        if (transactions[i].points > amount) {
                            transactions[i].points -= amount
                            spendCall.push({ payer: transactions[i].payer, points: -amount,timestamp:Date.now() })
                            amount = 0
                            break        
                        } else {
                            amount -= transactions[i].points
                            spendCall.push({ payer: transactions[i].payer, points: -transactions[i].points,timestamp:Date.now() })
                            transactions[i].points = 0
                        }
                       
                    }else{
                        console.log("points=0,next")
                    }                  
                }
            }
            spendCall.forEach(spend => {
                user.transactions.push(spend)
            })
        }
      
        user.transactions = transactions
        user.save()
        res.json(spendCall)

    }).catch((error) => {
        console.log(error);
    })

})



//////////////////////////////////////////
// helper function
//////////////////////////////////////////

function totalPoints(user) {
    let total = 0
    let transactions = user.transactions
    for (let i = 0; i < transactions.length; i++) {
        total += transactions[i].points
    }
    return total
}

function balance(user){
    let transactions = user.transactions
    let dictionary = {}
    transactions.forEach(transaction => {
       if (dictionary[transaction.payer]) {
           dictionary[transaction.payer] += transaction.points
       }else{
           dictionary[transaction.payer] = transaction.points
       }             
    })
    return dictionary
}

//////////////////////////////////////////
// Export the Router
//////////////////////////////////////////
module.exports = router