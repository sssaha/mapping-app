let arr = []; 
let arr2 = [];
let deviceIDs = [];
let long = 0.0;
let lat = 0.0;
let slong = 0.0;
let slat = 0.0;
const http = new XMLHttpRequest()
let latText = document.getElementById("latitude");
let longText = document.getElementById("longitude");


$( document ).ready(function() {
    console.log( "ready!" );
});




L.mapbox.accessToken = 'pk.eyJ1IjoiamdyaWphbHZhMjYiLCJhIjoiY2twbXZnMnpqMjRwbjJwbXc0dm1lemFpOCJ9.7dlUMKj5Mlt2PIQl84Ht0w';
let map = L.mapbox.map('map')
        .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));
    console.log("we been here")




function findMyCoordinates(){
    if(navigator.geolocation){
         navigator.geolocation.getCurrentPosition
        ((position) => {
            long = position.coords.longitude;
            lat = position.coords.latitude;
    
            latText.innerText = lat.toFixed(5).toString();
            longText.innerText = long.toFixed(5).toString();
            
            map.setView([lat, long],16);
            
            L.marker([lat, long], {
                icon: L.mapbox.marker.icon({
                    'marker-size': 'large',
                    'marker-color': '#EE4B2B'
                })
            }).addTo(map);

            

        },
        (err) => {
            alert(err.message);
        },
        {enableHighAccuracy: true}
        )
    } else {
        alert("Geolocation is not supported by your browser")
    }
}

window.onload = async function Function() {
    await findMyCoordinates();
    Papa.parse('epriDocuments.csv',{
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            arr2 = results.data;
        }
    });  
    
    Papa.parse('locations.csv',{
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            arr = results.data;
            var i = 0;
            while(i < arr.length){
                deviceIDs[i] = String(arr[i].ID);
                i++
            }

            if(document.getElementById('search')){
                let select = document.getElementById("search");
                while (select.firstChild) {
                    select.removeChild(select.firstChild);
                }
                let placeholderOption = new Option("Select Device by ID", "Select Device", true, true);
                select.add(placeholderOption);
                var i = 0;
                while(i < deviceIDs.length){
                    let newOption = new Option(deviceIDs[i], deviceIDs[i]);
                    select.add(newOption);
                    i++
                }
            }
        }
    });


}

if(document.getElementById('scan')){
    const scan = document.getElementById('scan').
        addEventListener('click', () => {
            let i = 0; 
            let j = 1;
            let select = document.getElementById("Select");
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
            var optiontxt;
            L.circle([lat, long], 500).addTo(map);
            
            let placeholderOption = new Option("Select Device", "Select Device", true, true);
            select.add(placeholderOption);
            while(i < arr.length){
                let d_long = Number(arr[i].Longitude);
                let d_lat = Number(arr[i].Latitude);
                let dist = distance(long, lat, d_long, d_lat);
                optiontxt = ("option" + i);

                
                if (dist <= 500){
                    var popup = L.popup()
                    .setLatLng([d_lat, d_long])
                    .setContent('<h1>' + arr[i].ID + " Type: " + arr[i].type + '</h1>')
                    .openOn(map);

                    L.marker([d_lat, d_long], {
                        icon: L.mapbox.marker.icon({
                            'marker-size': 'large',
                            'marker-color': '#023020'
                        })
                    }).bindPopup(popup).openPopup().addTo(map);

                    
                    let newOption = new Option(optiontxt, arr[i].ID);
                    newOption.text = ("ID: " + arr[i].ID + " Type: " + arr[i].type);
                    newOption.value = arr[i].type;
                    select.add(newOption);
                    j++;
                }
                i++;
            }    
        });
}    

function distance(lg, lt, dlg, dlt) {
    var nlg = lg * Math.PI/180;
    var nlt = lt * Math.PI/180
    var ndlg = dlg * Math.PI/180
    var ndlt = dlt * Math.PI/180
    
    let result = Math.acos(Math.sin(nlt) * Math.sin(ndlt) + Math.cos(nlt) * Math.cos(ndlt) * Math.cos(ndlg - nlg));

    return ((result * 6371) * 1000);
}



function selectDevice(data){
    var i = 0;
    // const selection = document.getElementById('selectedDocument');
    console.log(data)
    var optiontxt;
    const element = document.getElementById("files1");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    while(i < arr2.length){
        if(arr2[i].type == data){
            let link = document.createElement("a");
            let text = document.createTextNode(arr2[i].name);
            link.href = arr2[i].documents;
            link.target="_blank"
            link.appendChild(text);
            element.appendChild(link);
            element.appendChild(document.createElement("br"));
            link.classList.add('link-primary');
        }
        i++
    }
}





document.getElementById('submit').addEventListener('click', () => {
    console.log("Attempting to search...");
    const userInput = document.getElementById('search').value;
    console.log(userInput);
    let i = 0;
    let j = 0;
    let found = false;
    const element = document.getElementById("files");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    
    // Search in arr and display details
    while (!found) {
        if (String(arr[i].ID) === userInput) {
            document.getElementById('idVar').innerText = userInput;
            document.getElementById('long').innerText = arr[i].Longitude;
            document.getElementById('lat').innerText = arr[i].Latitude;
            document.getElementById('type').innerText = arr[i].type;

            // Search in arr2 and display linked documents
            let foundLink = false;
            while (!foundLink) {
                if (arr2[j].type === arr[i].type) {
                    let link = document.createElement("a");
                    let text = document.createTextNode(arr2[j].name);
                    link.href = arr2[j].documents;
                    link.target="_blank"
                    link.appendChild(text);
                    element.appendChild(link);
                    element.appendChild(document.createElement("br"));
                    link.classList.add('link-primary');
                    
                    // foundLink = true;
                }
                j++;
            }

            // Generate CSV data (if needed, you can do something with it, e.g., download or display it)
            var csv = Papa.unparse({
                "fields": ["ID", "Latitude", "Longitude", "type"],
                "data": [
                    [userInput, arr[i].Latitude, arr[i].Longitude, arr[i].type]
                ]
            });

            found = true; // End the while loop once the item is found
        }
        i++;
    }

    // Popup and map update
    if (found) {
        let popup = L.popup()
            .setLatLng([arr[i-1].Latitude, arr[i-1].Longitude]) // Use i-1 to get the last valid index
            .setContent('<h1>' + arr[i-1].ID + " Type: " + arr[i-1].type + '</h1>')
            .openOn(map);

        L.marker([arr[i-1].Latitude, arr[i-1].Longitude], {
            icon: L.mapbox.marker.icon({
                'marker-size': 'large',
                'marker-color': '#023020'
            })
        }).bindPopup(popup).openPopup().addTo(map);

        map.setView([arr[i-1].Latitude, arr[i-1].Longitude], 16);
        document.getElementById("map").focus();
    }
});



function copyCoord() {
    // Get the text field
    var copyText = (lat + "," + long);
  
    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText);
    
    // Alert the copied text
    alert("Copied the text: " + copyText);
  }

$( function() {
    $( "#search" ).autocomplete({
      source: deviceIDs
    });
  } 
);


function documentSelected(data){
    console.log(data)
    window.open("result.html", "_top");
}
