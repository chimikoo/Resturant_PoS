const fs = require("fs");
const path = require("path");
const readline = require("readline");

const menuFilePath = path.join(__dirname, "..", "json", "menu.json");
const ordersFilePath = path.join(__dirname, "..", "json", "orders.json");

const shoppingCart = [];

fs.readFile(menuFilePath, "utf8", (_err, data) => {
  const menu = JSON.parse(data);
  const categorizedMenu = categorizeItems(menu);
  const sortedMenuOrder = [
    "starter",
    "main course",
    "side dish",
    "dessert",
    "drink",
  ];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  displayMenu();

  function addToCart(item) {
    shoppingCart.push(item);
    console.log(`${item.name} has been added to the cart.`);
  }

  function viewCart() {
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
      'Enter the number of the category you want to display, "cart" to view the cart, "order" to finalize the order, "view orders" to view all orders, or "edit" to edit the menu: ',
      (choiceIndex) => {
        if (choiceIndex.toLowerCase() === "back") {
          displayMenu();
        } else if (choiceIndex.toLowerCase() === "cart") {
          viewCart();
          viewCategories();
        } else if (choiceIndex.toLowerCase() === "order") {
          finalizeOrder();
        } else if (choiceIndex.toLowerCase() === "view orders") {
          viewOrders();
        } else if (choiceIndex.toLowerCase() === "edit") {
          editMenu();
        } else {
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
      console.log("Items:");
      categorizedMenu[selectedCategory].forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
      });

      rl.question(
        'Enter the number of the item you want to add to the cart or "back" to return to the category list: ',
        (itemIndex) => {
          if (itemIndex.toLowerCase() === "back") {
            viewCategories();
          } else {
            const selectedItem =
              categorizedMenu[selectedCategory][parseInt(itemIndex) - 1];

            if (
              selectedItem.category === "drink" &&
              selectedItem.hasOwnProperty("big") &&
              selectedItem.hasOwnProperty("small")
            ) {
              askForDrinkSize(selectedItem);
            } else {
              addToCart(selectedItem);
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
            price: selectedItem[size.toLowerCase()].price,
          };
          addToCart(drinkItem);
          displayCategoryItems(
            sortedMenuOrder.indexOf(selectedItem.category) + 1
          );
        } else {
          console.error(
            'Invalid size selection. Please enter "big" or "small".'
          );
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
        viewCategories();
      } else if (option === "2") {
        editMenu();
      } else if (option === "3") {
        viewOrders();
      } else if (option === "4") {
        rl.close();
      } else {
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
        "Enter the category of the item (starter, main course, side dish, dessert, or drink): ",
        (itemCategory) => {
          rl.question("Enter the price of the item: ", (itemPrice) => {
            const price = parseFloat(itemPrice);

            rl.question(
              "Is the item vegetarian? (yes/no): ",
              (isVegetarian) => {
                rl.question("Is the item vegan? (yes/no): ", (isVegan) => {
                  const newItem = {
                    name: itemName,
                    category: itemCategory.toLowerCase(),
                    price: price,
                    isVegetarian: isVegetarian.toLowerCase() === "yes",
                    isVegan: isVegan.toLowerCase() === "yes",
                  };

                  menu.push(newItem);

                  fs.writeFile(
                    menuFilePath,
                    JSON.stringify(menu, null, 2),
                    "utf8",
                    () => {
                      console.log(`${itemName} has been added to the menu.`);
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
    console.log("\nAvailable Categories:");
    sortedMenuOrder.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });

    rl.question(
      "Enter the number of the category you want to edit or 'back' to return to the main menu: ",
      (choiceIndex) => {
        if (choiceIndex.toLowerCase() === "back") {
          editMenu();
        } else {
          choiceIndex = parseInt(choiceIndex);
          const selectedCategory = sortedMenuOrder[choiceIndex - 1];

          if (categorizedMenu[selectedCategory]) {
            console.log(`\nCategory: ${selectedCategory}`);
            console.log("Items:");
            categorizedMenu[selectedCategory].forEach((item, index) => {
              console.log(`${index + 1}. ${item.name}`);
            });

            rl.question(
              'Enter the number of the item you want to remove or "back" to return to the category list: ',
              (itemIndex) => {
                if (itemIndex.toLowerCase() === "back") {
                  removeItem();
                } else {
                  const selectedItem =
                    categorizedMenu[selectedCategory][parseInt(itemIndex) - 1];

                  const indexInMenu = menu.findIndex(
                    (item) => item.name === selectedItem.name
                  );

                  if (indexInMenu !== -1) {
                    menu.splice(indexInMenu, 1);

                    fs.writeFile(
                      menuFilePath,
                      JSON.stringify(menu, null, 2),
                      "utf8",
                      () => {
                        console.log(
                          `${selectedItem.name} has been removed from the menu.`
                        );
                        removeItem();
                      }
                    );
                  } else {
                    console.error(
                      `Item ${selectedItem.name} not found in the menu.`
                    );
                    removeItem();
                  }
                }
              }
            );
          } else {
            console.error("Selected category does not exist.");
            editMenu();
          }
        }
      }
    );
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

    menu.forEach((item) => {
      const category = item.category.toLowerCase();
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });

    return categories;
  }
});
