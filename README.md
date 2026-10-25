# ShopLab — demo electronics store for Adobe Analytics / Tags practice

Plain HTML + JS, no build step. Works on GitHub Pages, Netlify, or any static host.
Cart, login and orders live in `localStorage` — nothing is sent to a server.

## Pages & journey
| Page | File | pageType |
|---|---|---|
| Home (hero promo + featured) | `index.html` | home |
| Category listing | `category.html?c=phones` (phones / laptops / audio / wearables) | category |
| Product detail + related | `product.html?id=P1001` | product |
| Search results | `search.html?q=nova` | search |
| Cart (qty change, remove) | `cart.html` | cart |
| Checkout (form, payment step) | `checkout.html` | checkout |
| Order confirmation | `confirmation.html` | confirmation |
| Login | `login.html` | account |

## Setup
1. Push the folder to a repo → **Settings → Pages → Deploy from branch** (root).
2. Open `assets/js/config.js` and paste your Tags **Development** embed URL into `tagsEmbedUrl`. That's the only file to edit — every page loads it.
3. The ACDL library is already loaded on every page from unpkg. In Tags, install the **Adobe Client Data Layer** extension but **turn off "Inject ACDL library"** in its config so it isn't loaded twice.
4. A dark **adobeDataLayer** panel in the bottom-right shows every push live. Hide it with `?dldebug=0`, bring it back with `?dldebug=1`. Everything is also logged to the console.

## Data layer events
Every push goes into `window.adobeDataLayer`. Build Tags rules with the ACDL extension's **Data Pushed** event and the **Specific event** option.

| Event | Fires when | Key paths |
|---|---|---|
| `pageLoaded` | every page | `page.pageInfo.pageName / pageType / siteSection / subSection`, `user.loginStatus / userID`, `cart.itemCount / cartTotal` |
| `productListView` | a product grid renders | `productList.listName / listCount`, `productListItems[]` (with `position`) |
| `productListClick` | product clicked in a grid | `productList.listName`, `productListItems[0].position` |
| `productView` | PDP load | `productListItems[0]` |
| `cartAdd` | add to cart (grid, PDP, or qty increase in cart) | `cartAction.source`, `cartAction.isCartOpen`, `productListItems[0].quantity` |
| `cartRemove` | remove or qty decrease | `productListItems[0]` |
| `cartView` | cart page | `productListItems[]` |
| `checkoutStart` | checkout page load | `productListItems[]` |
| `checkoutStep` | first payment option chosen | `checkout.step`, `checkout.stepName` |
| `purchase` | confirmation page (once per orderID — refresh-safe) | `transaction.orderID / total / shipping / paymentMethod / couponCode`, `productListItems[]` |
| `searchPerformed` | search results page | `search.searchTerm`, `search.searchResults` (0 = null search) |
| `formStart` / `formSubmit` / `formError` | newsletter, checkout, login forms | `form.formName`, `form.formError` |
| `userLogin` / `userLogout` | login / logout | `user.userID`, `user.loginMethod` |
| `promoView` / `promoClick` | home hero banner | `promotion.promoID / promoName / promoPosition` |
| `linkClick` | any element with `data-link-name` (nav, logo, cart icon, CTAs) | `link.linkName`, `link.linkRegion` |

Product object shape (in every `productListItems[]`):
```json
{ "productID": "P1002", "SKU": "PH-NOVA-256P", "name": "Nova X Pro 256GB",
  "category": "Phones", "brand": "Nova", "unitPrice": 39999,
  "quantity": 1, "priceTotal": 39999, "currencyCode": "INR" }
```

## Suggested Adobe Analytics mapping (adjust to your report suite)
| Variable | Value |
|---|---|
| pageName | `page.pageInfo.pageName` |
| channel | `page.pageInfo.siteSection` |
| eVar1 / prop1 | page type |
| eVar2 | login status |
| eVar3 | user ID |
| eVar4 | internal search term (event10 = searches, event11 = null searches) |
| eVar5 | product list name — use **merchandising eVar (product syntax)** |
| eVar6 | form name; event20 start, event21 submit, event22 error |
| eVar7 | internal promo ID; event30 promo view, event31 promo click |
| eVar8 | payment method (on purchase) |
| eVar9 | coupon code |
| eVar10 | link name (link tracking `s.tl`) |
| events | prodView, scOpen (when `isCartOpen`), scAdd, scRemove, scView, scCheckout, purchase |
| products | `;{name or SKU};{quantity};{priceTotal}` built from `productListItems` |
| purchaseID | `transaction.orderID` |
| event40 (currency) | shipping |

Tip: build `s.products` in a custom code data element or in the Analytics extension's "Set variables → Custom code" by looping `productListItems` from `event.message`.

## Practice ideas
- Fix double-counting: refresh the confirmation page — `purchase` should not refire. Verify in Assurance / Debugger.
- Add Web SDK: send the same pushes as XDM (`commerce.productViews`, `commerce.productListAdds`, `commerce.order`) to an Edge datastream.
- Classifications: upload `products.js` data as SAINT/product classifications.
- Consent: add a banner and gate the Tags load in `config.js`.
