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

export const setEnableBackgroundImage = enableBackgroundImage => ({
    type: SET_ENABLE_BACKGROUND_IMAGE,
    enableBackgroundImage
});

export const setEnableFixedHeader = enableFixedHeader => ({
    type: SET_ENABLE_FIXED_HEADER,
    enableFixedHeader
});

export const setEnableHeaderShadow = enableHeaderShadow => ({
    type: SET_ENABLE_HEADER_SHADOW,
    enableHeaderShadow
});

export const setEnableSidebarShadow = enableSidebarShadow => ({
    type: SET_ENABLE_SIDEBAR_SHADOW,
    enableSidebarShadow
});

export const setEnablePageTitleIcon = enablePageTitleIcon => ({
    type: SET_ENABLE_PAGETITLE_ICON,
    enablePageTitleIcon
});

export const setEnablePageTitleSubheading = enablePageTitleSubheading => ({
    type: SET_ENABLE_PAGETITLE_SUBHEADING,
    enablePageTitleSubheading
});

export const setEnablePageTabsAlt = enablePageTabsAlt => ({
    type: SET_ENABLE_PAGE_TABS_ALT,
    enablePageTabsAlt
});

export const setEnableFixedSidebar = enableFixedSidebar => ({
    type: SET_ENABLE_FIXED_SIDEBAR,
    enableFixedSidebar
});

export const setEnableClosedSidebar = enableClosedSidebar => ({
    type: SET_ENABLE_CLOSED_SIDEBAR,
    enableClosedSidebar
});

export const setEnableMobileMenu = enableMobileMenu => ({
    type: SET_ENABLE_MOBILE_MENU,
    enableMobileMenu
});

export const setEnableMobileMenuSmall = enableMobileMenuSmall => ({
    type: SET_ENABLE_MOBILE_MENU_SMALL,
    enableMobileMenuSmall
});

export const setEnableFixedFooter = enableFixedFooter => ({
    type: SET_ENABLE_FIXED_FOOTER,
    enableFixedFooter
});

export const setBackgroundColor = backgroundColor => ({
    type: SET_BACKGROUND_COLOR,
    backgroundColor
});

export const setHeaderBackgroundColor = headerBackgroundColor => ({
    type: SET_HEADER_BACKGROUND_COLOR,
    headerBackgroundColor
});

export const setColorScheme = colorScheme => ({
    type: SET_COLOR_SCHEME,
    colorScheme
});

export const setBackgroundImageOpacity = backgroundImageOpacity => ({
    type: SET_BACKGROUND_IMAGE_OPACITY,
    backgroundImageOpacity
});

export const setBackgroundImage = backgroundImage => ({
    type: SET_BACKGROUND_IMAGE,
    backgroundImage
});
