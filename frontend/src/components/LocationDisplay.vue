<template>
  <div class="location-display">
    <h3>{{ t('locationDisplay.title') }}</h3>
    <div ref="mapContainer" class="map-container"></div>

    <div v-if="hasLocation" class="coordinates-display">
      <p>{{ t('locationDisplay.latitude') }}: {{ currentLat }}</p>
      <p>{{ t('locationDisplay.longitude') }}: {{ currentLng }}</p>
    </div>

    <!-- Show use-my-location button in edit mode only -->
    <CustomButton
        v-if="isEditMode"
        type="button"
        @click="useCurrentLocation"
        class="my-location-button"
    >
      {{ t('locationDisplay.useCurrentLocation') }}
    </CustomButton>
    <p v-if="locationError" class="error-message">{{ locationError }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import CustomButton from "@/components/CustomButton.vue";
import L from 'leaflet';
import { useI18n } from 'vue-i18n';
import 'leaflet/dist/leaflet.css';

const DEFAULT_LAT = 63.4293;
const DEFAULT_LNG = 10.4168;
const DEFAULT_ZOOM = 13;
const USER_LOCATION_ZOOM = 15;

const { t } = useI18n();

const props = defineProps({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['update:lat', 'update:lng']);
const mapContainer = ref(null);
const mapInstance = ref(null);
const markerInstance = ref(null);
const locationError = ref(null);
const currentLat = ref(props.lat);
const currentLng = ref(props.lng);

const customIcon = L.icon({
  iconUrl: '/map-marker.webp',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48]
});

const hasLocation = computed(() => {
  return currentLat.value !== null && currentLng.value !== null;
});

function initMap() {
  if (!mapContainer.value || mapInstance.value) return;

  try {
    mapInstance.value = L.map(mapContainer.value, {
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      zoomControl: true
    }).setView([currentLat.value || DEFAULT_LAT, currentLng.value || DEFAULT_LNG], DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.value);

    if (hasLocation.value) {
      createMarker(currentLat.value, currentLng.value);
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
      draggable: props.isEditMode,
      icon: customIcon
    }).addTo(mapInstance.value);

    if (!props.isEditMode) {
      markerInstance.value.bindPopup("Location of the advertisement").openPopup();

      setTimeout(() => {markerInstance.value.closePopup();}, 3000);
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
  createMarker(lat, lng);
}

async function useCurrentLocation() {
  locationError.value = null;

  if (!navigator.geolocation) {
    locationError.value = t('locationDisplay.errors.unsupported');
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
    mapInstance.value.setView([position.coords.latitude, position.coords.longitude], USER_LOCATION_ZOOM);

  } catch (error) {
    console.error("Error getting location:", error);
    handleGeolocationError(error);
  }
}

function handleGeolocationError(error) {
  let errorMessage = t('locationDisplay.errors.general');
  if (error && error.code) {
    switch (error.code) {
      case 1:
        errorMessage = t('locationDisplay.errors.denied');
        break;
      case 2:
        errorMessage = t('locationDisplay.errors.unavailable');
        break;
      case 3:
        errorMessage = t('locationDisplay.errors.timeout');
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