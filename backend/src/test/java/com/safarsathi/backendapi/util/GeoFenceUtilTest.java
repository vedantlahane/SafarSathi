package com.safarsathi.backendapi.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GeoFenceUtilTest {

    @Test
    void haversineMetersCalculatesKnownDistance() {
        double distance = GeoFenceUtil.haversineMeters(26.1667, 91.7086, 26.1667, 91.7186);
        assertThat(distance).isBetween(900.0, 1200.0);
    }

    @Test
    void isPointWithinRadiusReturnsTrueInsideCircle() {
        boolean inside = GeoFenceUtil.isPointWithinRadius(26.1668, 91.7090, 26.1667, 91.7086, 400.0);
        assertThat(inside).isTrue();
    }

    @Test
    void isPointWithinRadiusReturnsFalseOutsideCircle() {
        boolean inside = GeoFenceUtil.isPointWithinRadius(26.1900, 91.9000, 26.1667, 91.7086, 300.0);
        assertThat(inside).isFalse();
    }
}
