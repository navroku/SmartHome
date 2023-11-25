// devicelistScript.js
document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    const esp32ListContainer = document.getElementById('esp32ListContainer');
  
    // Function to open the device list modal
    function openDeviceListModal() {
      const deviceListModal = document.getElementById('deviceListModal');
      deviceListModal.style.display = 'block';
  
      // Load the content of esp32-list.ejs only if it hasn't been loaded yet
      if (!esp32ListContainer.innerHTML.trim()) {
        fetch('/esp32-devices')
          .then(response => response.text())
          .then(data => {
            esp32ListContainer.innerHTML = data;
          })
          .catch(error => {
            console.error('Error loading esp32-list:', error);
          });
      }
    }
  
    // Function to close the device list modal
    function closeDeviceListModal() {
      const deviceListModal = document.getElementById('deviceListModal');
      deviceListModal.style.display = 'none';
    }
  
    // Event listener for the "Show ESP32 Devices" button
    document.getElementById('showDeviceList').addEventListener('click', openDeviceListModal);
  
    // Event listener for the close button in the modal
    closeDeviceList.addEventListener('click', closeDeviceListModal);

    // Event listener for the modal overlay to close the modal
    document.getElementById('deviceListModal').addEventListener('click', function (event) {
      if (event.target === document.getElementById('deviceListModal')) {
        closeDeviceListModal();
      }
    });
  
    // Listen for updates from the server
    socket.on('updateDevices', devices => {
      // Update the content dynamically when a WebSocket update is received
      const listBody = document.getElementById('esp32ListBody');
  
      // Clear existing content
      listBody.innerHTML = '';
  
      devices.forEach(device => {
        const listItem = document.createElement('li');
        listItem.classList.add('items', 'odd');
  
        listItem.innerHTML = `
          <div class="infoWrap">
            <div class="listSection">
              <p class="itemNumber">${device.id}</p>
              <h3>${device.id}</h3>
            </div>
            <div class="prodTotal listSection">
              <p>${device.ip}</p>
            </div>
          </div>
        `;
  
        listBody.appendChild(listItem);
      });
    });
  });
