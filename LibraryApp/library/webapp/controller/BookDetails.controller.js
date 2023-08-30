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

            this.ratingIndicator = this.getView().byId("book-rating");
            const avg = this.getAverageRating();
            this.ratingIndicator.setValue(avg);
            this.ratingIndicator.setEnabled(false);
            const averageRatingLabel = this.getView().byId("average-rating");
            const averageRatingText = avg + "/5";
            averageRatingLabel.setText(averageRatingText);

            this.cnt = 0;
            this.populateReviewsTable();

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
                        rating: b.rating,
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
            var sValueState = sNewValue.length <= 100 ? "None" : "Warning";
            oTextArea.setValueState(sValueState);
        },
        onHandleChange: function () {
            this.ratingIndicator.setValue(this.getAverageRating());
        },
        onSubmit: function () {
            const rating = this.getView().byId("book-rating-input");
            const reviewInput = this.getView().byId("book-review-input");
            const reviewsTable = this.getView().byId("book-reviews");
        
            const ratingValue = rating.getValue();
            const reviewValue = reviewInput.getValue();

            if (ratingValue === 0){
                MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("ratingEmpty"));
                return 0;
            }
            else {
                let reviews = this.getReviews();
                if (reviews.length >= 3) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("reviewsFull"));
                    rating.setValue(0);
                    reviewInput.setValue("");
                    return 0;
                }
                else if (reviewValue === "") {
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("emptyReview"));
                    return 0;
                }
                else if (reviewValue.length > 100) {
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("limitReview"));
                    return 0;
                }
                else {
                    this.addReviewToTable(ratingValue, reviewValue, reviewsTable);
                    const newReview = {
                        rating: ratingValue,
                        comment: reviewValue
                    };
                    reviews.push(newReview);
                
                this.updateReviewsLocalStorage(reviews);
                const avg = this.getAverageRating();
                this.ratingIndicator.setValue(avg);
                const averageRatingLabel = this.getView().byId("average-rating");
                const averageRatingText = avg + "/5";
                averageRatingLabel.setText(averageRatingText);
                rating.setValue(0);
                reviewInput.setValue("");
                }
            }
        },
        updateReviewsLocalStorage: function(reviews) {
            let books = this.booksLocalStorage.get(this.booksArrayKey);
            let idCurrentBook = this.getIDFromUrl();
            const index = books.findIndex(b => b.id == idCurrentBook);
            books[index].reviews = reviews;

            this.booksLocalStorage.put(this.booksArrayKey, books);
        },
        getAverageRating: function () {
            const reviews = this.getReviews();
            let average = 0;

            if (reviews.length !== 0) {
                reviews.forEach((r) => {
                    average += r.rating;
                });
            average = average / reviews.length;
            average = average.toFixed(1);
            }
            return average;
        },
        getReviews: function() {
            let books = this.booksLocalStorage.get(this.booksArrayKey);
            let idCurrentBook = this.getIDFromUrl();
            let reviews;

            books.forEach((b) => {
                if (b.id == idCurrentBook) {
                    reviews = b.reviews;
                }
            });
            return reviews;
        },
        addReviewToTable(ratingValue, reviewValue, reviewsTable) {
            const len = this.cnt;
            const rating = new sap.m.RatingIndicator({
                value: ratingValue,
                enabled: false,
              });
            this.cnt ++;
            const VBox = new sap.m.VBox({
                backgroundDesign: "Transparent",
                items: [
                  rating,
                  new sap.m.Text({
                      text: reviewValue
                    }),
                ],
              });

            const HBox = new sap.m.HBox({
              backgroundDesign: "Transparent",
              items: [
                new sap.m.Image({
                  src: "/images/user.png",
                  height: "5vh",
                }),
                VBox
              ],
            });
      
            const reviewToBePosted = new sap.m.ColumnListItem({
              cells: [HBox],
            });
      
            reviewsTable.addItem(reviewToBePosted);
        },
        populateReviewsTable: function () {
            const reviewsTable = this.getView().byId("book-reviews");
            const reviews = this.getReviews();
            if (reviews !== null){
                reviews.forEach((r) => {
                    this.addReviewToTable(r.rating, r.comment, reviewsTable);});
            };
        },
        handleDeleteComment: function(oEvent) {
            const reviewsTable = this.getView().byId("book-reviews");
            const rating = this.getView().byId("book-rating");
            const listItem = oEvent.getParameter("listItem");
            const index = reviewsTable.indexOfItem(listItem);
			reviewsTable.removeItem(listItem);
            let reviews = this.getReviews();
            reviews.splice(index, 1);
            this.updateReviewsLocalStorage(reviews);
            const avg = this.getAverageRating();
            rating.setValue(avg);
            const averageRatingLabel = this.getView().byId("average-rating");
            const averageRatingText = avg + "/5";
            averageRatingLabel.setText(averageRatingText);
        }
    });
});