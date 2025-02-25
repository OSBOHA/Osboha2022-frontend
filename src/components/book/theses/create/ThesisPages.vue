<template lang="">
  <div class="row mt-2">
    <label
      class="form-label"
      :class="{ 'text-primary': pages.length === 0 && !startOver }"
    >
      {{ pages.length === 0 && !startOver ? "لقد أنهيت الكتاب" : "الصفحات" }}
      <small
        class="text-primary"
        v-if="pages.length > 0 && pagesCount > 1"
        style="font-size: 0.8rem"
      >
        ({{ pagesCount }})
      </small>
    </label>
  </div>
  <div class="row mb-4">
    <button
      class="btn btn-primary me-2 d-flex align-content-center justify-content-center"
      @click.prevent="startBookOver"
      v-if="pages.length === 0 && !startOver"
    >
      <span class="material-symbols-outlined md-18"> refresh </span>
      إعادة قراءة الكتاب
    </button>

    <template v-else>
      <small style="color: red" v-if="v$.thesisForm.pagesCount.$invalid">
        <span v-if="isRamadanBook"> * الحد الأدنى لكتب رمضان 15 صفحة </span>
        <span v-else-if="isTafseerBook">
          * الحد الأدنى لكتب التفسير 2 صفحات
        </span>
        <span v-else> * الحد الأدنى 3 صفحات </span>
      </small>

      <div class="form-group col-6 mb-0">
        <select
          class="form-select"
          data-trigger
          name="start_page"
          id="start_page"
          v-model="startPageProxy"
        >
          <option value="">صفحة البداية</option>
          <option v-for="page in pages" :value="page" :key="page">
            {{ page }}
          </option>
        </select>

        <div class="help-block" v-if="v$.thesisForm.start_page.$error">
          <small
            style="color: red"
            v-if="v$.thesisForm.start_page.required.$invalid"
            >الرجاء اختيار صفحة البداية</small
          >
          <small
            style="color: red"
            v-if="
              !v$.thesisForm.start_page.required.$invalid &&
              v$.thesisForm.start_page.between.$invalid
            "
            >البداية يجب ان تكون اقل من النهاية</small
          >
        </div>
      </div>
      <div class="form-group col-6 mb-0">
        <select
          class="form-select"
          data-trigger
          name="end_page"
          id="end_page"
          v-model="endPageProxy"
        >
          <option value="">صفحة النهاية</option>
          <option v-for="page in bookPagesEnd" :value="page" :key="page">
            {{ page }}
          </option>
        </select>
        <div class="help-block" v-if="v$.thesisForm.end_page.$error">
          <small
            style="color: red"
            v-if="v$.thesisForm.end_page.required.$invalid"
            >الرجاء اختيار صفحة النهاية</small
          >
          <small
            style="color: red"
            v-if="
              !v$.thesisForm.end_page.required.$invalid &&
              v$.thesisForm.end_page.between.$invalid
            "
            >النهاية يجب ان تكون اكبر من البداية</small
          >
        </div>
      </div>
      <div class="col-sm-12" v-if="startCheckingOverlapPages">
        <img
          src="@/assets/images/gif/page-load-loader.gif"
          alt="loader"
          style="height: 30px"
        />
        <small style="color: red">
          جاري التحقق من الصفحات, الرجاء الانتظار
        </small>
      </div>
      <small style="color: red" v-if="overlapPages && !loadingOverlapPages">
        تم قراءة هذه الصفحات من قبل
      </small>
      <button
        class="btn mb-2 text-primary text-decoration-underline px-2 py-0"
        @click.prevent="toggleShowAllPages"
        style="max-width: fit-content"
        v-if="startPageVal !== props.book.start_page"
      >
        >>
        {{ showAllPages ? "إظهار الصفحات الغير مقروءة" : "إظهار جميع الصفحات" }}
      </button>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, inject } from "vue";
import ThesisService from "@/API/services/thesis.service";

const startOver = ref(false);
const showAllPages = ref(false);
const loadingOverlapPages = ref(true);
const startCheckingOverlapPages = ref(false);

const v$ = inject("v$");

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  lastThesis: {
    type: Object,
    default: null,
  },
  thesisToEdit: {
    type: Object,
    default: null,
  },
  startPage: {
    type: [String, Number],
    default: "",
  },
  endPage: {
    type: [String, Number],
    default: "",
  },
  isRamadanActive: {
    type: Boolean,
    required: false,
    default: false,
  },
  pagesCount: {
    type: Number,
    required: false,
    default: 0,
  },
  overlapPages: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const emit = defineEmits([
  "update:startPage",
  "update:endPage",
  "changeOverlapPagesValue",
]);

const isRamadanBook = computed(
  () => props?.book.type.type === "ramadan" && props.isRamadanActive,
);
const isTafseerBook = computed(
  () => props?.book.type.type === "tafseer" && props.isRamadanActive,
);

const startPageVal = computed(() => {
  let start = null;

  //if user book exists, check last thesis and book status
  if (props.book.userBooks.length) {
    //if user has a book in progress, start pages from the last thesis end page
    if (props.book.userBooks[0].status === "in progress") {
      start = props.lastThesis
        ? props.lastThesis?.end_page === props.book.end_page
          ? props.book.start_page
          : props.lastThesis?.end_page + 1
        : props.book.start_page;
    }
    //otherwise, start pages from the book start page
    else {
      start = props.book.start_page;
    }
  }
  //otherwise, start pages from the book start page
  else {
    start = props.book.start_page;
  }

  //if user is editing the thesis, start pages from the book start page
  if (props.thesisToEdit) {
    start = props.book.start_page;
  }

  //if start null, it means the user has finished the book
  if (start === null) {
    //if start over button is not clicked, return empty array
    if (!startOver.value) return null;
    //if start over button is clicked, start pages from the book start page
    else start = props.book.start_page;
  }

  return start;
});

const pages = computed(() => {
  let allPages = [];
  let start = showAllPages.value ? props.book.start_page : startPageVal.value;

  if (start === null) {
    return [];
  }

  for (let i = start; i <= props.book.end_page; i++) {
    allPages.push(i);
  }

  return allPages;
});

const toggleShowAllPages = () => {
  showAllPages.value = !showAllPages.value;
  //reset start page and end page
  startPageProxy.value = "";
  endPageProxy.value = "";
};

const bookPagesEnd = computed(() => {
  return pages.value.filter((page) => page > startPageProxy.value);
});

const checkOverlapPages = (start_page, end_page) => {
  loadingOverlapPages.value = true;
  startCheckingOverlapPages.value = true;

  emit("changeOverlapPagesValue", true);

  ThesisService.checkThesisOverlap({
    start_page,
    end_page,
    book_id: props.book.id,
    thesis_id: props.thesisToEdit?.thesis.id,
  })
    .then((res) => {
      if (res.data.overlap) {
        emit("changeOverlapPagesValue", true);
      } else {
        emit("changeOverlapPagesValue", false);
      }
    })
    .finally(() => {
      loadingOverlapPages.value = false;
      startCheckingOverlapPages.value = false;
    });
};

const startPageProxy = computed({
  get() {
    return props.startPage;
  },
  set(value) {
    emit("update:startPage", value);

    //check pages overlap
    if (value && endPageProxy.value && endPageProxy.value >= value) {
      checkOverlapPages(value, endPageProxy.value);
    }
  },
});

const endPageProxy = computed({
  get() {
    return props.endPage;
  },
  set(value) {
    emit("update:endPage", value);

    //check pages overlap
    if (value && startPageProxy.value && value >= startPageProxy.value) {
      checkOverlapPages(startPageProxy.value, value);
    }
  },
});

const startBookOver = () => {
  startOver.value = true;
};
</script>
<style lang=""></style>
