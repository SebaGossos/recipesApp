function initApp() {

    getCategories();

    function getCategories() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
        fetch( url )
            .then( res => res.json() )
            .then( res => {
                console.log( res )
            })
    }
}

document.addEventListener('DOMContentLoaded', initApp());