$(document).ready(function () {

    // Set up Ajax prefilter to handle cross-domain requests
    $.ajaxPrefilter("json script", function (options) {
        options.crossDomain = true;
    });

    const sunriseSunsetApiBaseUrl = "https://api.sunrisesunset.io/json";

    // Custom error definition
    function CustomError(message) {
        this.name = 'CustomError';
        this.message = message || '';
        var error = new Error(this.message);
        error.name = this.name;
        this.stack = error.stack;
    }
    CustomError.prototype = Object.create(Error.prototype);

    $('#getCurrentLocationDataButton').click(() => {


        try {
            // Get current location
            getLocation().then(currentLocationLatLongPair => {
                console.log(currentLocationLatLongPair);

                // Convert location data to a query string
                const queryString = $.param(currentLocationLatLongPair);

                // Construct API URL
                
                let url = `${sunriseSunsetApiBaseUrl}?${queryString}`;
                // Fetch data from API
                getDataFromAPI(url).then(resultJson => {
                    // Populate document with sunrise-sunset data
                    displaySunriseSunsetData(resultJson.results, $('#result-container'), "Today's Info", null);
                }).catch(error => {
                    // Handle error from getDataFromAPI
                    console.error('An error occurred while fetching data:', error.message);
                });

                let urlForTomorrow = `${url}&date=${getTomorrowDate()}`;
                getDataFromAPI(urlForTomorrow).then(resultJson => {
                    // Populate document with sunrise-sunset data
                    displaySunriseSunsetData(resultJson.results, $('#result-container-tomorrow'), "Tomorrow's Info", null);
                }).catch(error => {
                    // Handle error from getDataFromAPI
                    console.error('An error occurred while fetching data:', error.message);
                });

            
            }).catch(error => {
                // Handle errors thrown by getLocation
                console.error('An error occurred:', error.message);
            }).finally(() => {
                console.log('Operation completed');
            });
        } catch (error) {
            // Handle any synchronous errors
            console.error('An error occurred:', error.message);
        }
    });


    function getTomorrowDate() {
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
    
        // Format date in YYYY-MM-DD
        var year = tomorrow.getFullYear();
        var month = ('0' + (tomorrow.getMonth() + 1)).slice(-2);
        var day = ('0' + tomorrow.getDate()).slice(-2);
    
        // Format the full date string
        var formattedDate = `${year}-${month}-${day}`;
    
        return formattedDate;
    }


    function displaySunriseSunsetData(data, resultContainer, heading, dis_name) {
        // Clear previous content
        resultContainer.empty();
    
        // Create a div to hold the sunrise-sunset data
        var sunriseSunsetDataDiv = $('<div>').addClass('mt-4');
    
        // Create a "Close" button
        var closeButton = $('<button>')
            .addClass('btn btn-danger close-btn')
            .text('Close')
            .click(function () {
                resultContainer.empty(); // Clear content when close button is clicked
            });
    
        // Create a heading for the data
        var headingElement = $('<h2>').addClass('mb-4 d-flex justify-content-between align-items-center').text(heading);
        
        // Append the "Close" button to the heading
        headingElement.append(closeButton);

        var info = $('<p>')
        if (dis_name !== null)
        {
           info.text(dis_name);
        }
    
        // Create a Bootstrap table to display specific data
        var table = $('<table>').addClass('table table-bordered');
        var tbody = $('<tbody>');
    
        // Specify the keys you want to display
        var keysToDisplay = [
            "sunrise",
            "sunset",
            "dawn",
            "dusk",
            "solar_noon",
            "day_length",
            "timezone"
        ];
    
        // Iterate over the specified keys and create table rows
        keysToDisplay.forEach(key => {
            var row = $('<tr>');
            var labelCell = $('<th>').text(formatKeyLabel(key));
            var valueCell = $('<td>').text(data[key]);
            row.append(labelCell, valueCell);
            tbody.append(row);
        });
    
        // Append the tbody to the table
        table.append(tbody);
    
        // Append the table to the div
        sunriseSunsetDataDiv.append(headingElement).append(info).append(table);
    
        // Append the div to the result container
        resultContainer.append(sunriseSunsetDataDiv);
    }
    
    
    
    // Function to format key labels (capitalize first letter)
    function formatKeyLabel(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, firstChar => firstChar.toUpperCase());
    }

    function closeResultContainer() {
        $('#result-container').empty();
    }

    function closeResultContainerTomorrow() {
        $('#result-container-tomorrow').empty();
    }



    // Function to get the current location
    function getLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    let lat = position.coords.latitude;
                    let lng = position.coords.longitude;
                    resolve({ lat, lng });
                }, error => {
                    reject(new CustomError('Failed to fetch current location info'));
                });
            } else {
                reject(new CustomError('Geolocation is not supported'));
            }
        });
    }

    function getDataFromAPI(url) {
        return axios.get(url)
            .then(response => {
                console.log('Data:', response.data);
                return response.data;
            })
            .catch(error => {
                console.error('Error:', error);
                throw error; // Propagate the error to the next catch block
            });
    }





// Event listener for the "Search" button
$('#searchLocationButton').click(function () {
    var location = $('#locationInput').val();
    if (location) {
        // Perform a geocoding API request to get the coordinates for the entered location
        geocodeLocation(location);
    }
});

function geocodeLocation(location) {
    // Perform a geocoding API request to get the coordinates for the entered location
    var geocodeUrl = 'https://geocode.maps.co/search?q=' + encodeURIComponent(location);

    axios.get(geocodeUrl)
        .then(response => {
            // Assuming the response contains geocoding data
            var geocodeData = response.data;

            // Display the geocoding results in the result container
            displaySearchResults(geocodeData);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displaySearchResults(results) {

    let searchContainer = $('#search-result-container')
    // Clear previous content
    searchContainer.empty();

    // Create a div to hold the search results
    var searchResultsDiv = $('<div>').addClass('mt-4');

    var closeButton = $('<button>')
    .addClass('btn btn-danger close-btn')
    .text('Close')
    .click(function () {
        searchContainer.empty(); // Clear content when close button is clicked
    });

    // Create a heading for the search results
    var heading = $('<h2>').addClass('mb-4 d-flex justify-content-between align-items-center').text('Search Results');
    // Append the "Close" button to the heading
    heading.append(closeButton);
    
    searchResultsDiv.append(heading);

    // Create a list group to display the search results
    var resultListGroup = $('<ul>').addClass('list-group');

    // Iterate over the results and create list items
    results.forEach(result => {
        // Extract latitude and longitude from the result
        var lat = result.lat;
        var lon = result.lon;
        var dis_name = result.display_name;

        // Create a list group item
        var listItem = $('<li>').addClass('list-group-item list-group-item-action d-flex justify-content-between align-items-center').text(result.display_name);

        // Add a click event to the list item
        listItem.click(function () {
            // Handle the click event (e.g., access latitude and longitude)
            handleResultClick(lat, lon, dis_name);
        });

        // Append the list item to the list group
        resultListGroup.append(listItem);
    });

    // Append the list group to the div
    searchResultsDiv.append(resultListGroup);

    // Append the div to the result container
    searchContainer.append(searchResultsDiv);
}

// Function to handle the click event when a result is clicked
function handleResultClick(lat, lon, dis_name) {
    
    console.log(`Clicked on result with Lat: ${lat}, Lon: ${lon}`);
    const queryString = `lat=${lat}&lng=${lon}`;

    // Construct API URL
    
    let url = `${sunriseSunsetApiBaseUrl}?${queryString}`;
    // Fetch data from API
    getDataFromAPI(url).then(resultJson => {
        // Populate document with sunrise-sunset data
        displaySunriseSunsetData(resultJson.results, $('#result-container-search'), "Today's Info", dis_name);
    }).catch(error => {
        // Handle error from getDataFromAPI
        console.error('An error occurred while fetching data:', error.message);
    });

    let urlForTomorrow = `${url}&date=${getTomorrowDate()}`;
    getDataFromAPI(urlForTomorrow).then(resultJson => {
        // Populate document with sunrise-sunset data
        displaySunriseSunsetData(resultJson.results, $('#result-container-search-tomorrow'), "Tomorrow's Info", dis_name);
    }).catch(error => {
        // Handle error from getDataFromAPI
        console.error('An error occurred while fetching data:', error.message);
    });
}












});




