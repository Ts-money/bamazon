const mysql = require("promise-mysql");
const inquirer = require("inquirer");

const conf = require('./config.js');

async function run() {
    const connection = await mysql.createConnection(conf);
    connection.query('SELECT * FROM products').then((res) => {
        console.log(`Available Products:`);
        for (var i = 0; i < res.length; i++) {
            let product = res[i];
            if (parseInt(product.stock_quantity) > 0) {
                console.log(product.product_name);
                console.log(`  ID: ${product.item_id}`);
                console.log(`  PRICE: $${product.price}`);
                console.log(`  QUANTITY REMAINING: ${product.stock_quantity}`);
            }
        }
        inquirer.prompt([
            {
                name: 'id',
                message: 'What is the ID of the product you want to buy?',
            },
            {
                name: 'quantity',
                message: 'How much do you want of this product?',
            }
        ])
            .then(answers => {
                for (var i = 0; i < res.length; i++) {
                    let product = res[i];
                    if (answers.id == product.item_id) {
                        if (product.stock_quantity >= answers.quantity) {
                            connection.query(`UPDATE products SET stock_quantity=${product.stock_quantity - answers.quantity} WHERE item_id=${product.item_id}`).then((response) => {
                                connection.end();
                            });
                            console.log('Your order has been successfully placed for a total of $' + answers.quantity * product.price);
                        } else {
                            console.log('We do not have enough stock to complete your order!')
                            connection.end();
                        }
                        break;
                    }
                }
            });
    });
}

run(); 