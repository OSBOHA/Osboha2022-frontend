<template>
    <div class="p-3">
        <div class="circular-progress-bars row d-flex justify-content-center">
            <div v-for="(point, key, index) in basic_points" :key="key"
                class="circular-progress-bar col-3 col-md-3 col-lg-3 text-center mt-2 mb-3">
                <svg viewBox="0 0 36 36">
                    <!-- Full circle (background) -->
                    <path class="circle-bg" d="M18 2.0845
        a 15.9155 15.9155 0 0 1 0 31.831
        a 15.9155 15.9155 0 0 1 0 -31.831" />

                    <!-- Points circle -->
                    <path class="circle points" :stroke-dasharray="(point / 50 * 100) + ', 100'" :class="'point-fill'"
                        d="M18 2.0845
        a 15.9155 15.9155 0 0 1 0 31.831
        a 15.9155 15.9155 0 0 1 0 -31.831" />

                    <!-- Violations circle  -->
                    <path class="circle violations" v-if="getViolationByIndex(index + 1) > 0"
                        :stroke-dasharray="(getViolationByIndex(index + 1) / 50 * 100) + ', 100'"
                        :class="'violation-fill'" d="M18 2.0845
        a 15.9155 15.9155 0 0 1 0 31.831
        a 15.9155 15.9155 0 0 1 0 -31.831" />

                    <text x="18" y="20.35" class="percentage" :transform="'rotate(90 18 18)'">
                        {{ Math.max(point - getViolationByIndex(index + 1), 0) }}
                    </text>
                </svg>

                <span>{{ MARATHON_WEEKS[key] }}</span>
            </div>
        </div>
        <div class="row d-flex justify-content-center">
            <hr class="mt-3 divider" />
            <div class="col-6 col-md-6 col-lg-6 text-center mt-2 mb-3">
                <h4 class="text-center">النقاط الاضافية</h4>
                <p class="text-center"> {{ bonus_points }} </p>
            </div>
            <div class="col-6 col-md-6 col-lg-6 text-center mt-2 mb-3">
                <h4 class="text-center">خصم نقاط</h4>
                <p class="text-center"> {{ totalViolationPoints }} </p>
            </div>
            <div class="col-6 col-md-6 col-lg-6 text-center mt-2 mb-3">
                <h4 class="text-center">المجموع الكلي</h4>
                <p class="text-center">
                    {{ total_points }} / 200
                </p>
            </div>
        </div>

    </div>
</template>

<script>
import { MARATHON_WEEKS } from "@/utilities/constants";

export default {
    props: {
        basic_points: {
            type: [Object],
            required: true,
        },
        week_violations: {
            type: [Object],
            required: true,
        },
        bonus_points: {
            type: Number,
            default: 0,
        },
        total_points: {
            type: Number,
            default: 0,
        },
    },

    data() {
        return {
            timeFrame: 'week',
            MARATHON_WEEKS,
        };
    },
    methods: {
        getViolationByIndex(index) {
            return this.week_violations[`week_violations_${index}`] || 0;
        },

    },
    computed: {
        totalViolationPoints() {
            return Object.values(this.week_violations).reduce((total, value) => total + value, 0);
        },
    }

};
</script>

<style scoped>
.circular-progress-bars {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
}

.circular-progress-bar {
    position: relative;
    text-align: center;
}

.circular-progress-bar svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
}

.circular-progress-bar .circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3.8;
}

.circular-progress-bar .circle {
    fill: none;
    stroke-width: 2.8;
    stroke-linecap: round;
    transition: stroke-dasharray 0.6s ease 0s;
}


.circular-progress-bar .circle.point-fill {
    stroke: #278036;
}

.divider {
    border: 0;
    height: 2px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

.circular-chart {
    width: 100px;
    height: 100px;
}

.circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3.8;
}

.circle {
    fill: none;
    stroke: #4caf50;
    stroke-width: 2.8;
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
}

.percentage {
    font-size: 10px;
    text-anchor: middle;
    dominant-baseline: middle;
}

.circular-progress-bar .circle.violation-fill {
    stroke: #7d1111;
}
</style>