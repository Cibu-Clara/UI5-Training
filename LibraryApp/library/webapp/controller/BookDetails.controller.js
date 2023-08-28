sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent"
], function (Controller, MessageBox, UIComponent) {
    "use strict";
    return Controller.extend("library.controller.BookDetails", {

        booksLocalStorage: jQuery.sap.storage(jQuery.sap.storage.Type.local),
        booksArrayKey: "LOCAL_STORAGE_KEY_BOOKS_ARRAY",

        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("bookDetails")
                .attachPatternMatched(this.getBookByID, this);

            console.log(this.getAverageRating());
            this.ratingIndicator = this.getView().byId("book-rating-indicator");
            this.ratingIndicator.setValue(this.getAverageRating());
            this.ratingIndicator.setEnabled(false);

            var oButton = this.getView().byId("languageButton");
            let currentWindow = window.location.href;
            if (currentWindow.includes("&sap-language=RO")) {
                oButton.setIcon("/images/english.png");
            }
            else {
                oButton.setIcon("/images/romanian.png");
            }
        },
        getBookByID: function (oEvent) {
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
                        average: b.average,
                        reviews: b.reviews,
                        cover: this.getBookCover(b.title)
                    });
                    this.getView().setModel(oModel, "bookModel");
                }
            });
        },
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },
        onNavBack: function () {
            this.getRouter().navTo("RouteMain");
            location.reload();
        },
        getBookCover: async function (title) {
            try {
                const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}&orderBy=relevance&printType=BOOKS`);
                const bookData = await response.json();

                const image = bookData.items[0]?.volumeInfo?.imageLinks?.smallThumbnail;
                return image !== undefined ? image : "/images/not-available.png";
            } catch (error) {
                console.error("Error fetching book cover:", error);
                return "/images/not-available.png";
            }
        },
        getIDFromUrl: function () {
            const hashParam = new URLSearchParams(window.location.hash);
            const id = hashParam.get("bookId");
            return id;
        },
        changeLanguage: function () {
            let currentWindow = window.location.href;
            if (currentWindow.includes("&sap-language=EN")) {
                currentWindow = currentWindow.replace("&sap-language=EN", "&sap-language=RO");
            }
            else if (currentWindow.includes("&sap-language=RO")) {
                currentWindow = currentWindow.replace("&sap-language=RO", "&sap-language=EN");
            }
            else {
                currentWindow = currentWindow + "&sap-language=RO";
            }
            window.location.href = currentWindow;
        },
        handleLiveChange: function (oEvent) {
            var oTextArea = oEvent.getSource();
            var sNewValue = oEvent.getParameter("value");
            var sValueState = sNewValue.length <= 40 ? "None" : "Warning";
            oTextArea.setValueState(sValueState);
        },
        onHandleChange: function () {
            this.ratingIndicator.setValue(this.getAverageRating());
        },
        onSubmit: function () {
            const rating = this.getView().byId("book-rating");
            const ratingValue = rating.getValue();
            let avg;
            if (ratingValue === 0){
                MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("ratingEmpty"));
                return 0;
            }
            const avgRating = Number(this.getAverageRating());
            if(avgRating !== 0) {
                avg = (avgRating + ratingValue) / 2;
                avg = avg.toFixed(1);
            }
            else {
                avg = ratingValue;
            }
            this.ratingIndicator.setValue(avg);
            this.updateBookLocalStorage(avg);
            const averageRatingLabel = this.getView().byId("average-rating");
            const averageRatingText = avg + "/5";
            averageRatingLabel.setText(averageRatingText);
            rating.setValue(0);
        },
        updateBookLocalStorage: function(avg) {
            let books = this.booksLocalStorage.get(this.booksArrayKey);
            let idCurrentBook = this.getIDFromUrl();
            const index = books.findIndex(b => b.id == idCurrentBook);
            books[index].average = avg;
            this.booksLocalStorage.put(this.booksArrayKey, books);
        },
        getAverageRating: function () {
            let books = this.booksLocalStorage.get(this.booksArrayKey);
            let idCurrentBook = this.getIDFromUrl();
            let average;

            books.forEach((b) => {
                if (b.id == idCurrentBook) {
                    average = b.average;
                }
            });
            return average;
        }
    });
});