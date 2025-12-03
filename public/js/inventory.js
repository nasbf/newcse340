'use strict';

// Usar el mismo select para ambas tablas. Si quieres dos selects separados puedes adaptar fácilmente.
let classificationList = document.querySelector("#classificationList");

// Si existe el select (management page), escuchamos cambios
if (classificationList) {
  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);

    if (!classification_id) {
      // limpiar tablas si se deselecciona
      const invDisplay = document.getElementById("inventoryDisplay");
      const reqTable  = document.getElementById("vehicleRequestTable");
      if (invDisplay) invDisplay.innerHTML = "";
      if (reqTable) reqTable.innerHTML = "";
      return;
    }

    // 1) Petición para la tabla Modify/Delete (ruta protegida usada por empleados)
    const classIdURL = "/inv/getInventory/" + classification_id;
    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) return response.json();
        // Si la ruta protegida devuelve 401/403, no pintamos nada aquí
        throw Error("Network response was not OK for admin inventory");
      })
      .then(function (data) {
        console.log("Admin inventory data:", data);
        // Si tu endpoint protegido devuelve array (según tu impl.) llamamos a buildInventoryList
        // Si tu endpoint devuelve { html: "..."} adáptalo para usar la propiedad correcta.
        buildInventoryList(data);
      })
      .catch(function (error) {
        console.log('There was a problem with admin inventory fetch: ', error.message);
      });

    // 2) Petición para la tabla Request (ruta pública)
    const reqURL = "/inv/getInventoryPublic/" + classification_id;
    fetch(reqURL)
      .then(function (response) {
        if (response.ok) return response.json();
        throw Error("Network response was not OK for request inventory");
      })
      .then(function (data) {
        console.log("Request inventory data:", data);
        // Llamamos a la función que arma la tabla Request
        vehicleRequestTable(data);
      })
      .catch(function (error) {
        console.log('There was a problem with request inventory fetch: ', error.message);
      });
  });
}

/* Build inventory items into HTML table components and inject into DOM */
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  if (!inventoryDisplay) return;
  let dataTable = '<thead>';
  dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
  dataTable += '</thead>';
  dataTable += '<tbody>';
  data.forEach(function (element) {
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
  });
  dataTable += '</tbody>';
  inventoryDisplay.innerHTML = dataTable;
}

/* Build request items into HTML table components and inject into DOM */
function vehicleRequestTable(data) {
  let inventoryDisplay = document.getElementById("vehicleRequestTable");
  if (!inventoryDisplay) return;
  let dataTable = '<thead>';
  dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td></tr>';
  dataTable += '</thead>';
  dataTable += '<tbody>';
  data.forEach(function (element) {
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href='/inv/request/${element.inv_id}' title='Request this vehicle'>Request</a></td></tr>`;
  });
  dataTable += '</tbody>';
  inventoryDisplay.innerHTML = dataTable;
}