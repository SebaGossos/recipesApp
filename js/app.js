function initApp() {

    const selectCategories = document.querySelector('#categorias');
    selectCategories.addEventListener('change', selectCategory)

    getCategories();

    function getCategories() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
        fetch( url )
            .then( res => res.json() )
            .then( showCategories )
    }

    function showCategories({ categories = [] }) {
        categories.forEach( category => {

            const { strCategory } = category;
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategories.appendChild( option );
        });
    }

    function selectCategory( e ) {
        const category = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${ category }`;

        fetch( url )
            .then( res => res.json() )
            .then( res => console.log(res ) )
    }
}

document.addEventListener('DOMContentLoaded', initApp());