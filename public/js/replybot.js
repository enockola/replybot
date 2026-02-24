// 1. Array of canned responses
const cannedResponses = [
    {
        category: "Intro",
        responses: [
            "Thank you for contacting BYU-Idaho! My name is Enoch. How can I assist you today?",
            "Hello! Welcome to BYU-Idaho's support. This is Enoch. What can I help you with today?"
        ]
    },
    {
        category: "Outro",
        responses: [
            "Thank you for reaching out! If you have any more questions, feel free to contact us again. Have a great day!",
            "It was a pleasure assisting you. Please let us know if there’s anything else we can help with."
        ]
    },
    {
        category: "Inactive",
        responses: [
            "It seems our conversation has been inactive for a while. If you still need assistance, please let us know.",
            "We haven’t heard from you in a bit. If you have any further questions, don’t hesitate to ask."
        ]
    },
    {
        category: "Survey",
        responses: [
            "We value your feedback! Please take a moment to complete a brief survey about your experience.",
            "Your opinion matters to us. Would you be willing to complete a short survey about your experience?"
        ]
    },
    {
        category: "Sympathy",
        responses: [
            "I’m sorry to hear about the difficulties you’re facing. We’re here to support you through it.",
            "We understand this might be a challenging time for you. Please let us know how we can help."
        ]
    },
    {
        category: "Email",
        responses: [
            "Dear [Name],\n\nThank you for reaching out. We appreciate your inquiry and will get back to you shortly.\n\nBest regards,\nEnoch",
            "Hello [Name],\n\nWe’re following up on your request and wanted to share more information. Let us know if we can assist further.\n\nSincerely,\nEnoch"
        ]
    }
];


// 2. Rendering and Initialized Canned Response
function responseTemplate(category, response, index, isFavorite = false) {
    return `
    <div class="content-box">
        <div class="shadow">
            <h1>${category} ${index + 1}</h1>
            <p>${response}</p>
            <span class="button-container">
                <button class="copy-btn">Copy</button>
                ${isFavorite ? removeButtonTemplate(response) : addButtonTemplate(response)}
            </span>
        </div>
    </div>
    `;
}

function addButtonTemplate(response) {
    return `<button class="favorite-btn" onclick="addToFavorites('${response}')">Add to favorite</button>`;
}

function removeButtonTemplate(response) {
    return `<button class="favorite-btn" onclick="removeFromFavorites('${response}')">Remove favorite</button>`;
}

function renderResponses(category, responseList, isFavorite = false) {
    const responseOutput = document.querySelector(".content");
    const responseHTML = responseList.map(function (response, index) {
        return responseTemplate(category, response, index, isFavorite);
    }).join("");
    responseOutput.innerHTML = responseHTML;
}

function init() {
    const introResponse = cannedResponses[2];
    renderResponses(introResponse.category, introResponse.responses);
}
init();


// 3. Click Sidebar to Display Canned Responses
function handleCategoryClick(event) {
    const categoryId = event.target.id;
    const selectedCategory = cannedResponses.find(item => item.category.toLowerCase() === categoryId.toLowerCase());

    if (selectedCategory) {
        renderResponses(selectedCategory.category, selectedCategory.responses);
    }
}

const categoryList = document.querySelector(".category");
categoryList.addEventListener("click", handleCategoryClick);


// 4. Copy functionality
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("copy-btn")) {
        const responseText = event.target.closest('.content-box').querySelector('p').textContent;

        navigator.clipboard.writeText(responseText).then(() => {
            alert("Copied to clipboard!");
        }).catch(err => {
            console.error("Error copying text: ", err);
        });
    }
});

// 5. Add to favorites
function addToFavorites(response) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (!favorites.includes(response)) {
        favorites.push(response);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${response} has been added to favorites!`);
    } else {
        alert(`${response} is already in favorites.`);
    }
}

// 6. Remove from favorites
function removeFromFavorites(response) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.indexOf(response);

    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${response} has been removed from favorites.`);
    } else {
        alert(`${response} is not in favorites.`);
    }
}

// 7. Render favorites using the responseTemplate function
function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        document.querySelector(".content").innerHTML = "<p>No favorites yet!</p>";
        return;
    }
    renderResponses("Favorites", favorites, true);
}

document.getElementById("show-favorites").addEventListener("click", showFavorites);