<template>
  <LoadingState :loading="loading" :error="error" :loadingMessage="t('itemView.loadingItem')"/>

  <p v-if="userWarning" class="user-warning">{{ userWarning }}</p>

  <div v-if="!loading && !error" class="item-detail-container">
    <!-- Image Gallery -->
    <ImageGallery
        :images="item.imageUrls || []"
        :alt-text="item.title"
        class="image-gallery"
    />

    <!-- Item Info -->
    <div class="item-info">
      <h1>{{ item.title }}</h1>

      <div class="overview-content">
        <div class="price-status">
          <span class="price">{{ item.price }} kr</span>
          <StatusBanner :status="item.status" />
        </div>
        <FavoriteBtn v-if="!isMyItem" :isFavorite="isFavorite" @update:isFavorite="updateFavoriteStatus" />
      </div>

      <div class="action-buttons">
        <template v-if="!isMyItem">
          <button class="message-btn" @click="handleMessageSeller">{{ t('itemView.sendMessage') }}</button>

          <button
            class="reserve-btn"
            @click="handleReserveItem"
            :disabled="hasPendingRes"
            @mouseover="showReserveTooltip = hasPendingRes"
            @mouseleave="showReserveTooltip = false"
          >
            {{ t('itemView.reserveItem') }}
          </button>
          <span v-if="showReserveTooltip && hasPendingRes" class="error-message">
            {{ t('itemView.pendingReservationTooltip') }}
          </span>

          <button
              class="blue-btn"
              @click="handleBuyNow"
              :disabled="!canBuyNow"
              @mouseover="showBuyNowTooltip = !canBuyNow"
              @mouseleave="showBuyNowTooltip = false"
          >
            {{ t('itemView.buyNow') }}
          </button>
          <span v-if="showBuyNowTooltip && !canBuyNow" class="error-message">
            {{ t('itemView.reservedByOtherTooltip') }}
          </span>

        </template>
        <router-link v-else :to="{ name: 'EditItemView', params: { id: item.id } }" class="blue-btn">
          {{ t('itemView.editItem') }}
        </router-link>


      </div>
    </div>

    <!-- Description Section -->
    <div class="description">
      <h3>{{ t('itemView.descriptionOfItem') }}</h3>
      <p>{{ item.description }}</p>
    </div>

    <!-- Location -->
    <LocationDisplay
        :lat="item.latitude"
        :lng="item.longitude"
    />

    <!-- Seller Info -->
    <div class="seller-info">
      <h3>{{ t('itemView.seller') }}</h3>
      <div class="seller">
        <div class="profile-badge">
          <img 
          :src="seller?.profilePicture || '/default-picture.jpg'" 
          alt="Profile Image" 
          class="profile-image" 
          />     
        </div>
        <span>{{ item.sellerName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ImageGallery from "@/components/ImageGallery.vue";
import { useItemStore } from "@/stores/itemStore";
import { useUserStore } from "@/stores/userStore";
import { useMessageStore } from '@/stores/messageStore';
import FavoriteBtn from "@/components/FavoriteBtn.vue";
import LoadingState from "@/components/LoadingState.vue";
import LocationDisplay from "@/components/LocationDisplay.vue";
import StatusBanner from "@/components/StatusBanner.vue";
import { useI18n } from 'vue-i18n'

const route = useRoute();
const itemStore = useItemStore();
const userStore = useUserStore();
const item = ref({});
const loading = ref(true);
const seller = ref(null);        
const error = ref(null);
const isMyItem = ref(false);
const isFavorite = ref(false);
const router = useRouter();
const messageStore = useMessageStore();
const userWarning = ref('');
const hasPendingRes = ref(false);
const showReserveTooltip = ref(false);
const showBuyNowTooltip = ref(false);
const { t } = useI18n()


const showWarning = (msg) => {
  userWarning.value = msg;
  setTimeout(() => userWarning.value = '', 5000); 
};

onMounted(async () => {
  loading.value = true;
  try {
    const itemId = route.params.id;
    if (!itemId) {
      error.value = t('itemView.errors.invalidId');
      return;
    }

    const itemData = await itemStore.fetchItemById(itemId);
    if (!itemData) {
      error.value = t('itemView.errors.itemNotFound');
      return;
    }

    item.value = itemData;
    isMyItem.value = userStore.user?.id === itemData.sellerId;

    if (itemData.sellerId) {
      try {
        const sellerData = await userStore.getUserById(itemData.sellerId);
        seller.value = sellerData;
      } catch {
        showWarning(t('itemView.errors.sellerInfoFailed'));
      }
    }

    if (!isMyItem.value) {
      try {
        await checkPendingReservation();
        await itemStore.logItemView(itemId);
      } catch {
        showWarning(t('itemView.errors.viewCountFailed'));
      }
    }

  } catch {
    error.value = t('itemView.errors.loadFailed');
  } finally {
    loading.value = false;
  }
});

const props = defineProps({
  id: {
    type: String,
    required: false
  }
});

const handleMessageSeller = async () => {
  const itemId = item.value.id;
  const sellerId = item.value.sellerId;

  try {
    await messageStore.ensureConversationExists(itemId, sellerId);
    await router.push({
      name: 'ConversationView',
      query: {
        itemId: itemId.toString(),
        withUserId: sellerId.toString()
      }
    });
  } catch {
    showWarning(t('itemView.errors.conversationFailed'));
  }
};

const handleReserveItem = async () => {
  try {
    const itemId = item.value.id;
    const sellerId = item.value.sellerId;

    await messageStore.ensureConversationExists(itemId, sellerId);

    await router.push({
      name: 'ConversationView',
      query: {
        itemId: itemId.toString(),
        withUserId: sellerId.toString(),
        reserve: 'true'
      }
    });
  } catch {
    showWarning(t('itemView.errors.reservationFailed'));
  }
};

const updateFavoriteStatus = (newStatus) => {
  isFavorite.value = newStatus;
};

const canBuyNow = computed(() => {
  return item.value.reservedById === null || item.value.reservedById === userStore.user?.id;
});

const handleBuyNow = async () => {
  try {
    const itemId = item.value.id;
    const redirectUrl = await itemStore.initiateVippsPayment(itemId);
    
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      showWarning(t('itemView.errors.paymentInitFailed'));
    }
  } catch {
    showWarning(t('itemView.errors.paymentProcessFailed'));
  }
};

const checkPendingReservation = async () => {
  try {
    const itemId = item.value.id;
    const sellerId = item.value.sellerId;

    const messages = await messageStore.fetchConversationWithUser(itemId, sellerId);

    hasPendingRes.value = messages.some(
      msg =>
        msg.reservationStatus === 'PENDING' &&
        msg.fromYou === true
    );
  } catch (err) {
    showWarning(t('itemView.errors.reservationCheckFailed'));
  }
};

</script>

<style scoped>
@import '../styles/views/ItemView.css';
</style>