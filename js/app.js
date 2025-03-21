function initApp() {

    // selectors
    const result = document.querySelector('#resultado');
    const modal = new bootstrap.Modal('#modal', {});

    // localStorage
    const getFavorites = () => JSON.parse( localStorage.getItem('favorites') ) ?? [];
    const saveFavorites = favorites => localStorage.setItem('favorites', JSON.stringify(favorites));


    const selectCategories = document.querySelector('#categorias');
    if ( selectCategories ) {
        selectCategories.addEventListener('change', selectCategory);
        getCategories();
    }
    
    const favoriteDiv = document.querySelector('.favoritos');

    if ( favoriteDiv ) {
        showFavorites();
    }


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
            .then( showRecipes )
    }

    function showRecipes(recipe) {

        const meals = recipe.meals ?? recipe;
    
        cleanHtml( result );

        
        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = meals?.length ? 'Resultados' : 'No hay resultados';
        result.appendChild( heading );
        

        // iterate in result
        meals?.forEach( recipe => {

            const { strMeal, strMealThumb, idMeal } = recipe; // for init page
            const { img, id, title } = recipe; // for My favorite page



            const recipeContainer = document.createElement('DIV');
            recipeContainer.classList.add('col-md-4');

            const recipeCard = document.createElement('DIV');
            recipeCard.classList.add('card', 'mb-4');

            const recipeImage = document.createElement('IMG');
            recipeImage.classList.add('card-img-top');
            recipeImage.alt = ` Imagen de la receta ${ strMeal }`
            recipeImage.src = strMealThumb ?? img;

            const recipeCardBody = document.createElement('DIV');
            recipeCardBody.classList.add('card-body');

            const recipeHeading = document.createElement('H3');
            recipeHeading.classList.add('card-title', 'mb-3');
            recipeHeading.textContent = strMeal ?? title;

            const recipeBtn = document.createElement('BUTTON');
            recipeBtn.classList.add('btn', 'btn-danger', 'w-100');
            recipeBtn.textContent = 'Mostrar Receta';
            // recipeBtn.dataset.bsTarget = "#modal";
            // recipeBtn.dataset.bsToggle = "modal";
            recipeBtn.onclick = function() {
                selectRecipe( idMeal ?? id );
            }

            
            /* 
            .result
                recipeConteiner
                    .card 
                        img
                        .card-body
                            h3
                            button 
            */
            recipeCardBody.appendChild( recipeHeading );
            recipeCardBody.appendChild( recipeBtn );

            recipeCard.appendChild( recipeImage );
            recipeCard.appendChild( recipeCardBody );
            
            recipeContainer.appendChild( recipeCard );

            result.appendChild( recipeContainer );

        });
    }

    function selectRecipe( id ) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${ id }`;
        fetch( url )
            .then(res => res.json())
            .then( res => showRecipeModal( res.meals[0] ))
    }

    function showRecipeModal( recipe ) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;
        
        
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');


        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img  clas="img-fluid" width=450 src="${ strMealThumb }" alt="recipe ${ strMeal }" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${ strInstructions }</p>
            <h3 class="my-3">Ingredientes y Cantidades<h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        // show quantity and ingredients
        for (let i = 1; i <= 20; i++ ) {
            if ( recipe[`strIngredient${ i }`] ) {
                const ingredient = recipe[`strIngredient${ i }`];
                const quantity = recipe[`strMeasure${ i }`];

                const ingredientLi = document.createElement('LI');
                ingredientLi.classList.add('list-group-item')
                ingredientLi.textContent = `${ ingredient } - ${ quantity }`;

                listGroup.appendChild( ingredientLi );
            }
        }

        modalBody.appendChild( listGroup );

        const modalFooter = document.querySelector('.modal-footer');
        cleanHtml( modalFooter );

        // botons to close and favorite
        const btnFavorite = document.createElement('BUTTON');
        btnFavorite.classList.add('btn', 'btn-danger', 'col');
        btnFavorite.textContent = isRecipeinLocalStorage( idMeal ) ? 'Eliminar Favorito' : 'Guardar Favorito';

        btnFavorite.onclick = () => {
            if( isRecipeinLocalStorage( idMeal ) ) {
                deleteFavorite(idMeal);
                btnFavorite.textContent = 'Guardar Favorito';
                showToast('Eliminando correctamente');
                if (favoriteDiv) {
                    setTimeout(() => {
                        window.location.reload()
                    },2000)
                }
                return;
            }
            addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            });
            btnFavorite.textContent = 'Eliminar Favorito';
            showToast('Agregado correctamente');

        }
        
        const btnCloseModal = document.createElement('BUTTON');
        btnCloseModal.classList.add('btn', 'btn-secondary', 'col');
        btnCloseModal.textContent = 'Cerrar';
        btnCloseModal.onclick = () => modal.hide();

        
        modalFooter.appendChild( btnFavorite );
        modalFooter.appendChild( btnCloseModal );
        
        // showModal
        modal.show();
        
    }

    function addFavorite( recipe ) {
        if( isRecipeinLocalStorage( recipe.id ) ) return;
        const newFavorite = [ ...getFavorites(), recipe ]
        saveFavorites( newFavorite );
    }
    
    function deleteFavorite( id ) {
        const favorites = getFavorites();
        const newFavorites = favorites.filter( item => item.id !== id );
        saveFavorites(newFavorites);
    }

    function isRecipeinLocalStorage( id ) {
        const favorites = getFavorites();
        if( favorites.some(item => item.id === id ) ) return true; // didn´t added to localStorage
        return false 
    }

    function showToast( message ) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast( toastDiv);
        toastBody.textContent = message;
        toast.show();
    }

    function showFavorites() {
        const favorites = getFavorites();
        if( favorites.length ) {
            showRecipes( favorites )
            return;
        }
        
        const noFavorites = document.createElement('P');
        noFavorites.textContent = 'No hay favoritos aún';
        noFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5' );
        favoriteDiv.appendChild( noFavorites );
    }

    function cleanHtml( selector ) {
        while( selector.firstChild ) {
            selector.removeChild( selector.firstChild );
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp());