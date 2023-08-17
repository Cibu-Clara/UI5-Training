sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent){
    "use strict";
    return Controller.extend("library.controller.BookDetails", {

        booksLocalStorage : jQuery.sap.storage(jQuery.sap.storage.Type.local),
        booksArrayKey : "LOCAL_STORAGE_KEY_BOOKS_ARRAY",

        onInit: function() {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("bookDetails")
                .attachPatternMatched(this.getBookByID, this);
        },
        getBookByID: function(oEvent) {
            const bookId = JSON.parse(oEvent.getParameter("arguments").bookId);
            
            let books = this.booksLocalStorage.get(this.booksArrayKey);
            books.forEach(b => {
                if (b.id === bookId) {
                    const oModel = new sap.ui.model.json.JSONModel({
                        id: b.id,
                        title: b.title,
                        author: b.author,
                        genre: b.genre,
                        year: b.year,
                        cover: this.getBookCover(b.title)
                    });
                    this.getView().setModel(oModel, "bookModel");
                }
            });
        },
        getRouter: function() {
            return UIComponent.getRouterFor(this);
        },
		onNavBack: function () {
			this.getRouter().navTo("RouteMain");
		},
        getBookCover: async function(title) {
            try {
                const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}&orderBy=relevance&printType=BOOKS`);
                const bookData = await response.json();
                
                const image = bookData.items[0]?.volumeInfo?.imageLinks?.smallThumbnail;
                return image !== null ? image : "library/images/not-available.png";
            } catch (error) {
                console.error("Error fetching book cover:", error);
                return "library/images/not-available.png";
            }
        }
    });
});