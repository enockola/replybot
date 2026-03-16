function addButtonTemplate(response) {
    return `<button class="favorite-btn" onclick="addToFavorites('${response}')">Add to favorite</button>`;
}

function removeButtonTemplate(response) {
    return `<button class="favorite-btn" onclick="removeFromFavorites('${response}')">Remove favorite</button>`;
}

// Copy functionality
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

// Add to favorites
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

// Remove from favorites
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

// Render favorites using the responseTemplate function
function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        document.querySelector(".content").innerHTML = "<p>No favorites yet!</p>";
        return;
    }
    renderResponses("Favorites", favorites, true);
}

document.getElementById("show-favorites").addEventListener("click", showFavorites);