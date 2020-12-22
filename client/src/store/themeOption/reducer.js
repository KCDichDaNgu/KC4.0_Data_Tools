import sideBar6 from '../../../public/images/sidebar/city1.jpg';

import {
    SET_ENABLE_BACKGROUND_IMAGE,
    SET_ENABLE_FIXED_HEADER,
    SET_ENABLE_HEADER_SHADOW,
    SET_ENABLE_SIDEBAR_SHADOW,
    SET_ENABLE_PAGETITLE_ICON,
    SET_ENABLE_PAGETITLE_SUBHEADING,
    SET_ENABLE_PAGE_TABS_ALT,
    SET_ENABLE_FIXED_SIDEBAR,
    SET_ENABLE_CLOSED_SIDEBAR,
    SET_ENABLE_MOBILE_MENU,
    SET_ENABLE_MOBILE_MENU_SMALL,
    SET_ENABLE_FIXED_FOOTER,
    SET_BACKGROUND_COLOR,
    SET_HEADER_BACKGROUND_COLOR,
    SET_COLOR_SCHEME,
    SET_BACKGROUND_IMAGE_OPACITY,
    SET_BACKGROUND_IMAGE
} from './type';

import { themeOption2 } from '../../constants';

const initialState = themeOption2;

export const ThemeOptionReducer = (state = initialState, action) => {

    switch (action.type) {
        case SET_ENABLE_BACKGROUND_IMAGE:
            return {
                ...state,
                enableBackgroundImage: action.enableBackgroundImage
            };

        case SET_ENABLE_FIXED_HEADER:
            return {
                ...state,
                enableFixedHeader: action.enableFixedHeader
            };

        case SET_ENABLE_HEADER_SHADOW:
            return {
                ...state,
                enableHeaderShadow: action.enableHeaderShadow
            };

        case SET_ENABLE_SIDEBAR_SHADOW:
            return {
                ...state,
                enableSidebarShadow: action.enableSidebarShadow
            };

        case SET_ENABLE_PAGETITLE_ICON:
            return {
                ...state,
                enablePageTitleIcon: action.enablePageTitleIcon
            };

        case SET_ENABLE_PAGETITLE_SUBHEADING:
            return {
                ...state,
                enablePageTitleSubheading: action.enablePageTitleSubheading
            };

        case SET_ENABLE_PAGE_TABS_ALT:
            return {
                ...state,
                enablePageTabsAlt: action.enablePageTabsAlt
            };

        case SET_ENABLE_FIXED_SIDEBAR:
            return {
                ...state,
                enableFixedSidebar: action.enableFixedSidebar
            };

        case SET_ENABLE_MOBILE_MENU:
            return {
                ...state,
                enableMobileMenu: action.enableMobileMenu
            };

        case SET_ENABLE_MOBILE_MENU_SMALL:
            return {
                ...state,
                enableMobileMenuSmall: action.enableMobileMenuSmall
            };

        case SET_ENABLE_CLOSED_SIDEBAR:
            return {
                ...state,
                enableClosedSidebar: action.enableClosedSidebar
            };

        case SET_ENABLE_FIXED_FOOTER:
            return {
                ...state,
                enableFixedFooter: action.enableFixedFooter
            };

        case SET_BACKGROUND_COLOR:
            return {
                ...state,
                backgroundColor: action.backgroundColor
            };

        case SET_HEADER_BACKGROUND_COLOR:
            return {
                ...state,
                headerBackgroundColor: action.headerBackgroundColor
            };

        case SET_COLOR_SCHEME:
            return {
                ...state,
                colorScheme: action.colorScheme
            };

        case SET_BACKGROUND_IMAGE:
            return {
                ...state,
                backgroundImage: action.backgroundImage
            };

        case SET_BACKGROUND_IMAGE_OPACITY:
            return {
                ...state,
                backgroundImageOpacity: action.backgroundImageOpacity
            };
    }
    return state;
}
