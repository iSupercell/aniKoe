const app = {};

// Jikan API endpoint
app.apiUrl = `https://api.jikan.moe/v3/`;

// API call to get list of characters from search input
app.getCharaList = (characterName) => {
    $.ajax({
        url: `${app.apiUrl}search/character`,
        method: `GET`,
        dataType: `JSON`,
        data: {
            q: `${characterName}`,
            genre: 12,
            genre_exclude: 0,
            limit: 10,
        }
    }).then((data) => {
        $('.aniChara, .characterResults, .seiyuuResults, .vcContainer').empty();
        $('.vcContainer, .direction3').addClass('hide');
        $('.notice').removeClass('hide');
        app.displayChara(data);
    }).catch((err) => {
        $('.direction3, .notice').removeClass('hide');
        $('.intro, .direction1, .direction2, .characterResults, .seiyuuResults, .vcContainer, .aniChara').addClass('hide');
    });
};

// API call to get selected character info
app.getChara = (charaId) => {
    $.ajax({
        url: `${app.apiUrl}character/${charaId}`,
        method: `GET`,
        dataType: `JSON`
    }).then((data) => {
        app.showVc(data);
    });
};

// API call to get selected voice actor info
app.getVc = (vcId) => {
    $.ajax({
        url: `${app.apiUrl}person/${vcId}`,
        method: `GET`,
        dataType: `JSON`
    }).then((data) => {
        app.displayVc(data);
    });
};


// Code for displaying characters from search input
app.displayChara = (results) => {
    
    // Apply filter so that only characters in anime with image will be shown
    const charaResults = results.results;
    const animeOnly = charaResults.filter((aniChara) => {
        return (aniChara.image_url != `https://cdn.myanimelist.net/images/questionmark_23.gif` && aniChara.anime.length > 0);
    });

    animeOnly.forEach((chara) => {
        const cleanName = chara.name.replace(`,`, ``);
        const charaHtml = `
        <li>
            <div class="charaContainer">
                <img src="${chara.image_url}" alt="${cleanName}">
                <div class="charaOverlay" tabIndex="0">
                    <p>${cleanName}</p>
                </div>
            </div>
        </li>
        `;
        $('.intro, .direction2, .aniChara').addClass('hide');
        $('.direction1, .characterResults').removeClass('hide');
        $('.characterResults').append(charaHtml);
    });

    $('.characterResults li').on('click', (e) => {
        const targetItem = e.target.closest(`li`);
        const uniqueItem = Array.from($('.characterResults')[0].children);
        const itemIndex = uniqueItem.findIndex(currentItem => currentItem === targetItem);
        const itemId = animeOnly[itemIndex].mal_id;
        app.getChara(itemId);
    });

    $('.characterResults li').on('keyup', (e) => {
        const targetItem = e.target.closest(`li`);
        const uniqueItem = Array.from($('.characterResults')[0].children);
        const itemIndex = uniqueItem.findIndex(currentItem => currentItem === targetItem);
        const itemId = animeOnly[itemIndex].mal_id;
        if (e.key === `Enter`) {
            app.getChara(itemId);
        }
    });
};


// Code for displaying JP voice actors of chosen character
app.showVc = (results) => {

    // Apply filter so that only JP voice actors will be shown
    const vcList = results.voice_actors;
    const jpOnly = vcList.filter((vc) => {
        return vc.language === `Japanese`;
    });

    jpOnly.forEach((jpVc) => {
        const cleanName = jpVc.name.replace(`,`, ``);
        const vcResultsHtml = `
        <li>
            <div class="seiyuuContainer">
                <img src="${jpVc.image_url}" alt="${cleanName}">
                <div class="seiyuuOverlay" tabIndex="0">
                    <p>${cleanName}</p>
                </div>
            </div>
        </li>
        `;
        $('.direction1, .direction3, .characterResults').addClass('hide');
        $('.direction2, .seiyuuResults').removeClass('hide');
        $('.seiyuuResults').append(vcResultsHtml);
    });

    $('.seiyuuResults li').on('click', (e) => {
        const targetItem = e.target.closest(`li`);
        const uniqueItem = Array.from($('.seiyuuResults')[0].children);
        const itemIndex = uniqueItem.findIndex(currentItem => currentItem === targetItem);
        const itemId = jpOnly[itemIndex].mal_id;
        app.getVc(itemId);
    });

    $('.seiyuuResults li').on('keyup', (e) => {
        const targetItem = e.target.closest(`li`);
        const uniqueItem = Array.from($('.seiyuuResults')[0].children);
        const itemIndex = uniqueItem.findIndex(currentItem => currentItem === targetItem);
        const itemId = jpOnly[itemIndex].mal_id;
        if (e.key === `Enter`) {
            app.getVc(itemId);
        }
    });
};


// Code for displaying voice actor's info and all their main roles
app.displayVc = (results) => {
    
    // Cleaning up Birthday data from API results
    const editBday = results.birthday;
    const editedBday = editBday.substr(0, 10);

    // HTML code for voice actor information
    const vcHtml = `
    <div class="portraitContainer">
        <img src="${results.image_url}" alt="${results.name}">
    </div>
    <ul class="vcInfo">
        <li><h2><i aria-hidden="true" class="far fa-address-card"></i> ${results.name}</h2></li>
        <li><h3>${results.family_name} ${results.given_name}</h3></li>
        <li><p>Birthday: ${editedBday}</p></li>
        <li><p>Total Roles: ${results.voice_acting_roles.length}</p></li>
        <li><p>MyAnimeList: <a href="${results.url}" target="_blank" rel="noopener noreferrer"> <i class="fas fa-link"></i> Click</a></p></li>
    </ul>
    `;
    $('.direction2, .seiyuuResults, .notice').addClass('hide');
    $('.vcContainer').removeClass('hide');
    $('.vcContainer').append(vcHtml);

    // Apply filter so that only main roles with image will be shown
    const rolesArray = results.voice_acting_roles;
    const onlyMain = rolesArray.filter((roleType) => {
        return (roleType.character.image_url != `https://cdn.myanimelist.net/images/questionmark_23.gif` && roleType.role.length == 4);
    });

    // HTML code for voice roles
    onlyMain.forEach((role) => {
        const cleanName = role.character.name.replace(`,`, ``);
        const aniRoles = `
        <li>
            <div class="roleContainer">
                <img src="${role.character.image_url}" alt="${role.character.name}">
                <div class="overlay" tabIndex="0">
                    <p>Anime:</p>
                    <p class="animeName">${role.anime.name}</p>
                    <p>Character Name</p>
                    <p class="charaName">${cleanName}</p>
                </div>
            </div>
        </li>
        `;
        $('.aniChara').removeClass('hide');
        $('.aniChara').append(aniRoles);
    });
};


// Code that kicks off the app
app.init = function() {
    // Code for Search input
    $('form').on('submit', function(event) {
        event.preventDefault();
        const charaSearch = $('input').val();
        app.getCharaList(charaSearch);
        $('#searchInput').val('');
    });
};


// Document Ready
$(() => {
    app.init();
});