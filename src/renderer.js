// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
require("alpinejs");
const _ = require("lodash");
const { ipcRenderer, ipcMain } = require("electron");

function app() {
  return {
    result: 0,
    numeric: _.range(1, 11),
    numPad: false,
    productPad: true,
    productList: [],
    currentProduct: null,
    currentQuantity: null,
    adminLogin: false,
    adminMdp: "",
    isAdmin: false,
    numericLogin: _.shuffle(_.range(10)),
    plusLeft: 0,
    operatorQuantity: "",
    currentList: [],
    error: "",
    lastTotal: 0,
    commandList: [],
    commandTotal: 0,
    commandAdded: false,
    readonlyMdp: "1",
    isCreatingProduct: false,
    createProductIcon: true,
    isElectron: false,
    isCommandHistory: false,
    product: {
      label: "",
      price: {
        unit: 0,
        cents: 0,
      },
    },
    init() {
      this.productList = [
        {
          label: "mon_super_produit",
          price: 3.9,
          image: "assets/placeholder-1.jpg",
        },
        {
          label: "mon_mega_produit",
          price: 7,
          image: "assets/placeholder-2.jpg",
        },
      ];
      this.isElectron =
        navigator.userAgent.toLowerCase().indexOf(" electron/") > -1;
    },
    togglePad() {
      this.error = "";
      this.numPad = !this.numPad;
      this.productPad = !this.productPad;
    },
    toggleAddProductIcon() {
      this.toggle("isCreatingProduct");
      this.toggle("createProductIcon");
    },
    toggle(prop) {
      this.error = "";
      this[prop] = !this[prop];
    },
    selectProduct(index) {
      this.error = "";
      this.currentProduct = this.productList[index];
    },
    selectQuantity(index) {
      this.error = "";
      this.currentQuantity = this.numeric[index];
      if (!this.operatorQuantity.length) {
        return true;
      }
      switch (this.operatorQuantity) {
        case "+":
          this.currentQuantity += this.plusLeft;
          break;
        case "*":
          this.currentQuantity *= this.plusLeft;
          break;
      }
      this.plusLeft = 0;
      this.operatorQuantity = "";
    },
    cancelSelectQuantity() {
      this.error = "";
      this.currentQuantity = null;
      this.plusLeft = 0;
      this.operatorQuantity = "";
      this.currentProduct = null;
      this.togglePad();
    },
    cancelProductList() {
      this.currentList = [];
      this.cancelSelectQuantity();
    },
    login() {
      if (this.adminMdp == this.readonlyMdp) {
        this.isAdmin = true;
        this.toggle("adminLogin");
      }
    },
    plusCurrentQuantity() {
      this.error = "";
      this.plusLeft = this.currentQuantity;
      this.operatorQuantity = "+";
    },
    multiplyCurrentQuantity() {
      this.error = "";
      this.plusLeft = this.currentQuantity;
      this.operatorQuantity = "*";
    },
    createNewProduct() {
      this.error = "";
      if (this.product.label.length) {
        this.error = "Veuillez ajouter un intitulé au produit"
        return false
      }
      if (this.product.price.unit == 0 && this.product.price.cents == 0) {
        this.error = "Veuillez ajouter un prix au produit"
        return false
      }
      ipcRenderer.invoke("create-product", {
        label: this.product.label,
        price: this.product.price,
        image: this.product.image
      })
      return true
    },
    chooseProductImage() {
      const image = dialog.showOpenDialog({
        properties: ["openFile", "openDirectory", "multiSelections"],
      });
      console.log(image)
    },
    addProduct(toggle = true) {
      this.error = "";
      if (!this.currentQuantity) {
        this.error = "Veuillez sélectionner la quantité.";
        return true;
      }
      if (!this.currentProduct) {
        this.error = "Veuillez sélectionner un produit";
        return true;
      }
      const currentListTotal = this.currentProduct.price * this.currentQuantity;
      this.currentList.push({
        product: this.currentProduct,
        quantity: this.currentQuantity,
        total: currentListTotal,
      });
      this.lastTotal += currentListTotal;
      this.currentProduct = null;
      this.currentQuantity = null;
      if (toggle === true) {
        this.togglePad();
      }
    },
    addCommande() {
      this.error = "";
      if (this.currentQuantity) {
        this.addProduct(false);
      }
      if (!this.currentList.length) {
        this.error =
          "La liste de commande est vide. Veuillez ajouter des produits";
        return true;
      }
      const date = new Date();
      this.commandList.push({
        date,
        liste: this.currentList,
        total: this.lastTotal,
      });
      this.commandTotal += this.lastTotal;
      this.currentQuantity = null;
      this.currentProduct = null;
      this.toggle("commandAdded");
    },
    confirmAddCommande() {
      this.lastTotal = 0;
      this.toggle("commandAdded");
      this.togglePad();
      this.currentList = [];
    },
    addAdminMdp(value) {
      this.adminMdp = `${this.adminMdp}${value}`;
    },
    backwardAdminMdp(value) {
      this.adminMdp = _.chain(this.adminMdp)
        .split("")
        .dropRight(1)
        .join("")
        .value();
    },
    resetAdminMdp() {
      this.adminMdp = "";
    },
  };
}
