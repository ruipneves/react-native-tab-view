/* @flow */

import * as React from 'react';
import { StyleSheet, I18nManager } from 'react-native';
import Animated from 'react-native-reanimated';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type { Route, SceneRendererProps, NavigationState } from './types';

export type Props<T> = {|
  ...SceneRendererProps,
  dynamicWidth?: boolean,
  navigationState: NavigationState<T>,
  style?: ViewStyleProp,
  tabWidths: number[],
  width: number,
|};

export default function TabBarIndicator<T: Route>(props: Props<T>) {
  const {
    dynamicWidth,
    tabWidths,
    width,
    position,
    navigationState,
    style,
  } = props;
  const { routes } = navigationState;

  let translateX = null;
  let scaleX = 1;
  let dynamicStyle = { width: `${100 / routes.length}%` };

  if (dynamicWidth) {
    let inputRange = [];
    let translateOutputRange = [];
    let scaleOutputRange = [];
    let totalWidth = 0;
    routes.forEach((route: Route, i: number) => {
      if (i !== 0) {
        totalWidth += tabWidths[i - 1];
      }
      inputRange.push(i);
      translateOutputRange.push(totalWidth + tabWidths[i] * 0.5);
      scaleOutputRange.push(tabWidths[i]);
    });

    translateX = Animated.interpolate(position, {
      inputRange,
      outputRange: translateOutputRange,
      extrapolate: 'clamp',
    });

    scaleX = Animated.interpolate(position, {
      inputRange,
      outputRange: scaleOutputRange,
      extrapolate: 'clamp',
    });
    dynamicStyle = { width: 1 };
  } else {
    translateX = Animated.multiply(
      Animated.interpolate(position, {
        inputRange: [0, routes.length - 1],
        outputRange: [0, routes.length - 1],
        extrapolate: 'clamp',
      }),
      width
    );
  }

  translateX = Animated.multiply(translateX, I18nManager.isRTL ? -1 : 1);

  return (
    <Animated.View
      style={[
        styles.indicator,
        dynamicStyle,
        // If layout is not available, use `left` property for positioning the indicator
        // This avoids rendering delay until we are able to calculate translateX
        width
          ? { transform: [{ translateX }, { scaleX }] }
          : { left: `${(100 / routes.length) * navigationState.index}%` },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: '#ffeb3b',
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    height: 2,
  },
});
