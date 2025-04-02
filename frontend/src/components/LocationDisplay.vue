<template>
  <div class="location-display">
    <h3>Location</h3>
    <div ref="mapContainer" class="map-container"></div>

    <p>Latitude: {{ currentLat }}</p>
    <p>Longitude: {{ currentLng }}</p>

    <!-- Show coordinates and use-my-location button in edit mode only -->
    <div v-if="isEditMode" class="coordinates-display">

      <button type="button" @click="useCurrentLocation" class="location-button">
        Use My Current Location
      </button>
      <p v-if="locationError" class="error-message">{{ locationError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  lat: { type: [Number, String], default: null },
  lng: { type: [Number, String], default: null },
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['update:lat', 'update:lng']);
const mapContainer = ref(null);
const mapInstance = ref(null);
const markerInstance = ref(null);
const locationError = ref(null);
const currentLat = ref(props.lat);
const currentLng = ref(props.lng);

const hasLocation = computed(() => {
  return currentLat.value !== null && !isNaN(Number(currentLat.value)) &&
      currentLng.value !== null && !isNaN(Number(currentLng.value));
});

function initMap() {
  if (!mapContainer.value) return;

  try {
    mapInstance.value = L.map(mapContainer.value, {
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      zoomControl: true
    }).setView([
      Number(currentLat.value) || 63.4293, // Default Trondheim
      Number(currentLng.value) || 10.4168
    ], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.value);

    if (hasLocation.value) {
      createMarker(Number(currentLat.value), Number(currentLng.value));
    }

    if (props.isEditMode) {
      mapInstance.value.on('click', (e) => {
        updateLocation(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstance.value.invalidateSize();
  } catch (error) {
    console.error("Map initialization error:", error);
  }
}

function createMarker(lat, lng) {
  if (markerInstance.value) {
    markerInstance.value.setLatLng([lat, lng]);
  } else {
    markerInstance.value = L.marker([lat, lng], {
      draggable: props.isEditMode
    }).addTo(mapInstance.value);

    if (!props.isEditMode) {
      markerInstance.value
          .bindPopup("Location of the advertisement")
          .openPopup();

      setTimeout(() => {
        markerInstance.value.closePopup();
      }, 3000);
    }

    if (props.isEditMode) {
      markerInstance.value.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        updateLocation(newPos.lat, newPos.lng);
      });
    }
  }
}

function updateLocation(lat, lng) {
  currentLat.value = lat;
  currentLng.value = lng;
  emit('update:lat', lat);
  emit('update:lng', lng);

  if (mapInstance.value) {
    createMarker(lat, lng);
  }
}

async function useCurrentLocation() {
  locationError.value = null;

  if (!navigator.geolocation) {
    locationError.value = "Geolocation is not supported by your browser";
    return;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });

    updateLocation(
        position.coords.latitude,
        position.coords.longitude
    );

    if (mapInstance.value) {
      mapInstance.value.setView([position.coords.latitude, position.coords.longitude], 15);
    }

  } catch (error) {
    console.error("Error getting location:", error);
    handleGeolocationError(error);
  }
}

function handleGeolocationError(error) {
  let errorMessage = "Could not get your current location. Please make sure location services are enabled.";

  if (error && error.code) {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        errorMessage = "Location access was denied. Please enable location permissions in your browser settings.";
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMessage = "Location information is unavailable. Please check your network connection.";
        break;
      case 3: // TIMEOUT
        errorMessage = "The request to get your location timed out. Please try again.";
        break;
    }
  }
  locationError.value = errorMessage;
}

onMounted(() => {
  initMap()
});

watch(() => [props.lat, props.lng], ([newLat, newLng]) => {
  currentLat.value = newLat;
  currentLng.value = newLng;
  if (mapInstance.value && hasLocation.value) {
    createMarker(Number(newLat), Number(newLng));
  }
});

</script>

<style scoped>
@import '../styles/components/LocationDisplay.css';
</style>