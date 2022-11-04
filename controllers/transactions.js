const express = require('express');
const router = express.Router();
const User = require('../models/user');

//////////////////////////////////////////
// routes
//////////////////////////////////////////


//-- seeding data --//

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




//-- balance route --//

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





//-- spend route --//

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
                    
                    if (transactions[i].points > 0 && amount > 0 && transactions[i].used === false) {
                        if (transactions[i].points > amount) {
                            if(transactions[i].points ==0 ){
                                transactions[i].used = true
                            }
                    
                            spendCall.push({ payer: transactions[i].payer, points: -amount,timestamp:Date.now(), used:true })
                            amount = 0
                            break        
                        } else if (amount >= transactions[i].points ) {
                            amount -= transactions[i].points
                            transactions[i].used = true
                            spendCall.push({ payer: transactions[i].payer, points: -transactions[i].points,timestamp:Date.now() })
                            
                        }
                       
                    }
                    else if (transactions[i].points < 0 && amount > 0 && transactions[i].used === false) {
                        transactions[i].used = true
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
        
        res.json(spendResponse(spendCall))

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

function spendResponse(spendCall){
    let spendResponse = []
    spendCall.forEach(spend => {
        spendResponse.push({payer:spend.payer,points:spend.points})
    })
    return spendResponse
}



//////////////////////////////////////////
// Export the Router
//////////////////////////////////////////
module.exports = router