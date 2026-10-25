/*
 * Adobe Client Data Layer (ACDL) wiring.
 * The ACDL library is loaded in <head> of every page. All tracking data
 * is pushed through window.adobeDataLayer — build your Tags rules on these
 * event names (use the "Adobe Client Data Layer" extension in Tags).
 *
 * Events pushed:
 *   pageLoaded, productListView, productListClick, productView,
 *   cartAdd, cartRemove, cartView, checkoutStart, checkoutStep,
 *   purchase, searchPerformed, formStart, formSubmit, formError,
 *   userLogin, userLogout, linkClick, promoView, promoClick
 */
window.adobeDataLayer = window.adobeDataLayer || [];

const DL = {
  debug: true,

  push(obj) {
    window.adobeDataLayer.push(obj);
    if (this.debug) console.log('%c[adobeDataLayer]', 'color:#e34850;font-weight:bold', obj.event || '(state)', obj);
    if (window.DLPanel) window.DLPanel.log(obj);
  },

  product(p, qty = 1) {
    return {
      productID: p.id,
      SKU: p.sku,
      name: p.name,
      category: CATEGORIES[p.category] || p.category,
      brand: p.brand,
      priceTotal: +(p.price * qty).toFixed(2),
      unitPrice: p.price,
      quantity: qty,
      currencyCode: 'INR'
    };
  },

  pageLoaded({ name, type, section, subSection = '' }) {
    const user = Store.getUser();
    this.push({
      event: 'pageLoaded',
      page: {
        pageInfo: {
          pageName: `shoplab:${name}`,
          pageType: type,
          siteSection: section,
          subSection,
          url: location.href,
          path: location.pathname,
          referrer: document.referrer,
          language: document.documentElement.lang || 'en',
          server: location.hostname
        }
      },
      user: {
        loginStatus: user ? 'logged in' : 'guest',
        userID: user ? user.id : '',
        userType: user ? 'registered' : 'anonymous'
      },
      cart: Store.cartSummary()
    });
  }
};
