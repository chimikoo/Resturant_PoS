const fs = require("fs");
const path = require("path");
const readline = require("readline");

const menuFilePath = path.join(__dirname, "..", "json", "menu.json");
const ordersFilePath = path.join(__dirname, "..", "json", "orders.json");

const shoppingCart = [];

fs.readFile(menuFilePath, "utf8", (_err, data) => {
  const menu = JSON.parse(data);
  const sortedMenuOrder = [
    "starter",
    "main course",
    "side dish",
    "dessert",
    "drink",
  ];

  const categorizedMenu = categorizeItems(menu);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  displayMenu();

  function categorizeItems(menu) {
    return menu;
  }

  function addToCart(selectedItem) {
    shoppingCart.push(selectedItem);
    console.log(`\n${selectedItem.name} has been added to the order.`);
  }

  function viewCart() {
    console.clear();
    console.log("\nShopping Cart:");
    if (shoppingCart.length === 0) {
      console.log("The cart is empty.");
    } else {
      let total = 0;
      shoppingCart.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - €${item.price}`);
        total += item.price;
      });
      console.log(`\nTotal Price: €${total.toFixed(2)}`);
    }
  }

  function viewCategories() {
    console.log("\nAvailable Categories:");
    sortedMenuOrder.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });

    rl.question(
      `Enter the number of the category you want to display\n\n"cart" to view the cart\n"order" to finalize the order\n"back" to go back to main menu\n\n> `,
      (choiceIndex) => {
        if (choiceIndex.toLowerCase() === "back") {
          console.clear()
          displayMenu();
        } else if (choiceIndex.toLowerCase() === "cart") {
          console.clear()
          viewCart();
          viewCategories();
        } else if (choiceIndex.toLowerCase() === "order") {
          console.clear()
          finalizeOrder();
        } else if (choiceIndex.toLowerCase() === "view orders") {
          console.clear()
          viewOrders();
        } else if (choiceIndex.toLowerCase() === "edit") {
          console.clear()
          editMenu();
        } else {
          console.clear()
          displayCategoryItems(choiceIndex);
        }
      }
    );
  }

  function displayCategoryItems(choiceIndex) {
    choiceIndex = parseInt(choiceIndex);
    const selectedCategory = sortedMenuOrder[choiceIndex - 1];

    if (categorizedMenu[selectedCategory]) {
      console.log(`\nCategory: ${selectedCategory}`);
      categorizedMenu[selectedCategory].forEach((item, index) => {
        if(item.hasOwnProperty("sizes")) {
          console.log(`
          ${index + 1}. ${item.name}
          Glass: €${item.sizes.small.price}
          Bottle: €${item.sizes.big.price}`); // Handle items with different sizes (drinks)
        } else {
          console.log(`
          ${index + 1}. ${item.name} 
          Price: €${item.price}
          Vegetarian: ${item.isVegetarian ? "Yes" : "No"}
          Vegan: ${item.isVegan ? "Yes" : "No"}
          `); // normal menu items dessert etc
        }
      });

      rl.question(
        'Enter the number of the item you want to add to the cart or "back" to return to the category list\n: ',
        (input) => {
          if (input.toLowerCase() === "back") {
            console.clear()
            viewCategories();
          } else if (input.toLowerCase() === "size") {
            askForDrinkSize();
          } else {
            const selectedItemIndex = parseInt(input) - 1;
            if(selectedItemIndex >= 0 && selectedItemIndex < categorizedMenu[selectedCategory].length) {
              const selectedItem = categorizedMenu[selectedCategory][selectedItemIndex];

              if (selectedItem.hasOwnProperty("sizes")) {
                askForDrinkSize(selectedItem);
              } else {
                addToCart(selectedItem);
                console.clear()
                displayCategoryItems(choiceIndex);
                console.log(`\n${selectedItem.name} has been added to the order.`);
              }
            } else {
              console.error("Invalid item number. Please enter a valid number.");
              displayCategoryItems(choiceIndex);
            }
          }
        }
      );
    } else {
      console.error("Selected category does not exist.");
      displayMenu();
    }
}

  function askForDrinkSize(selectedItem) {
    rl.question(
      `Select size for ${selectedItem.name} - "big" or "small": `,
      (size) => {
        if (size.toLowerCase() === "big" || size.toLowerCase() === "small") {
          const drinkItem = {
            ...selectedItem,
            size: size.toLowerCase(),
            price: selectedItem.sizes[size.toLowerCase()].price,
          };
          addToCart(drinkItem);
          displayCategoryItems(sortedMenuOrder.indexOf(selectedItem.category) + 1);
        } else {
          console.error('Invalid size selection. Please enter "big" or "small".');
          askForDrinkSize(selectedItem);
        }
      }
    );
  }

  function displayMenu() {
    console.log("\nMenu Options:");
    console.log("1. Start new Order");
    console.log("2. Edit Menu (admin)");
    console.log("3. View All Orders");
    console.log("4. Exit");

    rl.question("Enter the option number: ", (option) => {
      if (option === "1") {
        console.clear()
        viewCategories();
      } else if (option === "2") {
        console.clear()
        editMenu();
      } else if (option === "3") {
        console.clear()
        viewOrders();
      } else if (option === "4") {
        rl.close();
      } else {
        console.clear()
        console.error("Invalid option. Please enter a valid option number.");
        displayMenu();
      }
    });
  }

  function editMenu() {
    console.log("\nEdit Menu Options:");
    console.log("1. Add item to Menu");
    console.log("2. Remove item");
    console.log("3. Back to the main menu");

    rl.question("Enter the option number: ", (option) => {
      if (option === "1") {
        addItemToMenu();
      } else if (option === "2") {
        removeItem();
      } else if (option === "3") {
        displayMenu();
      } else {
        console.error("Invalid option. Please enter a valid option number.");
        editMenu();
      }
    });
  }

  function addItemToMenu() {
    rl.question("Enter the name of the item you want to add: ", (itemName) => {
      rl.question(
        "Enter the category of the item (starter, main course, side dish, dessert, drink): ",
        (itemCategory) => {
          if (!menu[itemCategory]) {
            console.error("Invalid category. Please enter a valid category.");
            addItemToMenu();
            return;
          }
          rl.question("Enter the price of the item: ", (itemPrice) => {
            const price = parseFloat(itemPrice);
            rl.question(
              "Is the item vegetarian? (yes/no): ",
              (isVegetarian) => {
                rl.question("Is the item vegan? (yes/no): ", (isVegan) => {
                  const newItem = {
                    name: itemName,
                    price: price,
                    isVegetarian: isVegetarian.toLowerCase() === "yes",
                    isVegan: isVegan.toLowerCase() === "yes",
                  };

                  menu[itemCategory].push(newItem);

                  fs.writeFile(
                    menuFilePath,
                    JSON.stringify(menu, null, 2),
                    "utf8",
                    () => {
                      console.log(`${itemName} has been added to the ${itemCategory}.`);
                      editMenu();
                    }
                  );
                });
              }
            );
          });
        }
      );
    });
  }

  function removeItem() {
    rl.question("Enter the category from which to remove an item: ", (category) => {
      if (!menu[category]) {
        console.error("Invalid category. Please enter a valid category.");
        removeItem();
        return;
      }

      console.log(`\nItems in ${category}:`);
      menu[category].forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
      });

      rl.question("Enter the number of the item you want to remove: ", (itemIndex) => {
        itemIndex = parseInt(itemIndex) - 1;
        if (itemIndex < 0 || itemIndex >= menu[category].length) {
          console.error("Invalid item number. Please enter a valid number.");
          removeItem();
          return;
        }

        const removedItem = menu[category].splice(itemIndex, 1)[0];

        fs.writeFile(menuFilePath, JSON.stringify(menu, null, 2), "utf8", () => {
          console.log(`${removedItem.name} has been removed from the ${category}.`);
          editMenu();
        });
      });
    });
  }

  function finalizeOrder() {
    if (shoppingCart.length === 0) {
      console.log(
        "The cart is empty. Please add items to the cart before finalizing the order."
      );
      displayMenu();
      return;
    }

    rl.question("Enter the table number for the order: ", (tableNumber) => {
      const orderNumber = generateOrderNumber();
      const order = {
        name: `Order ${orderNumber}`,
        tableNumber: tableNumber,
        items: shoppingCart,
      };

      fs.readFile(ordersFilePath, "utf8", (readErr, ordersData) => {
        let orders = [];

        if (!readErr) {
          orders = JSON.parse(ordersData);
        }

        orders.push(order);

        fs.writeFile(
          ordersFilePath,
          JSON.stringify(orders, null, 2),
          "utf8",
          () => {
            console.log("Order finalized and saved successfully.");
            shoppingCart.length = 0;
            displayMenu();
          }
        );
      });
    });
  }

  function generateOrderNumber() {
    const ordersData = fs.readFileSync(ordersFilePath, "utf8");
    let orders = [];
    orders = JSON.parse(ordersData);

    let maxOrderNumber = 0;

    orders.forEach((order) => {
      const orderName = order.name || "";
      const match = orderName.match(/Order (\d+)/);

      if (match) {
        const currentOrderNumber = parseInt(match[1]);
        if (!isNaN(currentOrderNumber) && currentOrderNumber > maxOrderNumber) {
          maxOrderNumber = currentOrderNumber;
        }
      }
    });

    return maxOrderNumber + 1;
  }

  function viewOrders() {
    fs.readFile(ordersFilePath, "utf8", (readErr, ordersData) => {
      if (readErr) {
        console.error("Error reading the orders file:", readErr);
        displayMenu();
        return;
      }

      let orders;
      orders = JSON.parse(ordersData);

      console.log("\nAll Orders:");
      orders.forEach((order) => {
        console.log(
          `${order.name} - Table: ${order.tableNumber || "Not specified"}`
        );
        let orderTotal = 0;
        order.items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} - €${item.price}`);
          orderTotal += item.price;
        });
        console.log(`   Total: €${orderTotal.toFixed(2)}`);
        console.log("---------------------------------------------");
      });

      displayMenu();
    });
  }

  function categorizeItems(menu) {
    const categories = {};
    Object.keys(menu).forEach((category) => {
      categories[category] = menu[category];
    });
    return categories;
  }
});
