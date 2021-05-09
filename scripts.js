// Overview of how it should work
// ---------------------------- //
// A search bar for user to search for voice actors by name
// Quick information on the voice actor will appear next to their picture
// The search will return the list of characters the voice actors voiced (filter the results to only show main roles)
// Append the list of characters and include their picture, name and the anime title they are from
// Search bar will empty once the user submit a name
// Previously appended results will be replaced by new search results



// ---------------------------- //
// My codes starts below!!!
const app = {};


// Make a jQuery AJAX request to get info of voice actors
app.getVc = function(id) {
    $.ajax({
        url: `https://api.jikan.moe/v3/person/${id}`,
        method: `GET`,
        dataType: `JSON`
    }).then(function(data) {
        // console.log(`vc data`, data);
        $('.aniChara').empty();
        app.displayVc(data);
    });
};


// Code for displaying data from API
app.displayVc = function(results) {
    // console.log(`this is info`, results);
    
    // Cleaning up Birthday data from API results
    const editBday = results.birthday;
    const editedBday = editBday.substr(0, 10);

    // HTML code for voice actor information
    const vcHtml = `
    <img src="${results.image_url}" alt="${results.name}">
    <ul class="vcInfo">
        <li><h2><i aria-hidden="true" class="far fa-address-card"></i> ${results.name}</h2></li>
        <li><h3>${results.family_name} ${results.given_name}</h3></li>
        <li><p>Birthday: ${editedBday}</p></li>
        <li><p>Total Roles: ${results.voice_acting_roles.length}</p></li>
        <li><p>MyAnimeList: <a href="${results.url}"> <i class="fas fa-link"></i> Click</a></p></li>
    </ul>
    `;
    $('.vcCard').html(vcHtml);

    // Apply filter so that only main character roles will show
    const rolesArray = results.voice_acting_roles;
    const onlyMain = rolesArray.filter(function(roleType) {
        return roleType.role.length == 4;
    });

    // HTML code for voice roles (and append to page)
    onlyMain.forEach(function(role) {
        // console.log(role);
        const aniRoles = `
        <li>
            <img src="${role.character.image_url}" alt="${role.character.name}">
            <div class="overlay">
                <p>Anime:</p>
                <p class="animeName">${role.anime.name}</p>
                <p>Character Name</p>
                <p class="charaName">${role.character.name}</p>
            </div>
        </li>
        `;
        $('.aniChara').append(aniRoles);
    });
};


// Code that kicks off the app
app.init = function() {
    // console.log('ready');
    
    // Code for Search input
    $('form').on('submit', function(event) {
        event.preventDefault();
        const vcSearch = $('input').val();
        app.getVc(vcSearch);
        // console.log(`this is an input`, vcSearch)
        $('#searchInput').val('');
    });
};


// Document Ready
$(function() {
    app.init();
});