export function NoOfCardsToRender(cardType, cardSize = "") {
  switch (cardType) {
    case "sheet_poster":

    case "overlay_poster":
    case "overlayIcon_poster":
    case "network_poster":
    case "content_poster":
    case "custom_poster":
    case "expands_poster":
    case "expands_preview_poster":
    case "large_poster":
    case "live_poster":
      if (!!cardSize && cardSize == "big") {
        return {
          1650: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            cardsPerGridRow: 4,
            cardPaddingGrid: 7,
            gridPadding: 51,
          },
          1300: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            cardsPerGridRow: 4,
            cardPaddingGrid: 7,
            gridPadding: 48,
          },
          1199: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            cardsPerGridRow: 4,
            cardPaddingGrid: 7,
            gridPadding: 23,
          },
          1024: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            cardsPerGridRow: 3,
            cardPaddingGrid: 7,
            gridPadding: 20,
          },
          767: {
            slidesPerView: 2.5,
            slidesPerGroup: 2,
            cardsPerGridRow: 2,
            cardPaddingGrid: 3,
            gridPadding: 16,
          },
          576: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            cardsPerGridRow: 2,
            cardPaddingGrid: 4,
            gridPadding: 20,
          },
          200: {
            slidesPerView: 2.1,
            slidesPerGroup: 2.2,
            cardsPerGridRow: 2.2,
            cardPaddingGrid: 4,
            gridPadding: 12,
          },
        };
      } else {
        return {
          1650: {
            slidesPerView: 6,
            slidesPerGroup: 6,
            cardsPerGridRow: 6,
            cardPaddingGrid: 7,
            gridPadding: 51,
          },
          1300: {
            slidesPerView: 5,
            slidesPerGroup: 5,
            cardsPerGridRow: 5,
            cardPaddingGrid: 7,
            gridPadding: 48,
          },
          1199: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            cardsPerGridRow: 4,
            cardPaddingGrid: 7,
            gridPadding: 23,
          },
          1024: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            cardsPerGridRow: 4,
            cardPaddingGrid: 7,
            gridPadding: 20,
          },
          767: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            cardsPerGridRow: 4,
            cardPaddingGrid: 4,
            gridPadding: 16,
          },
          576: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            cardsPerGridRow: 3,
            cardPaddingGrid: 4,
            gridPadding: 20,
          },
          200: {
            slidesPerView: 2.1,
            slidesPerGroup: 2.1,
            cardsPerGridRow: 2,
            cardPaddingGrid: 4,
            gridPadding: 12,
          },
        };
      }
    case "expand_poster":
      return {
        1650: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1199: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 23,
        },
        1024: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 20,
        },
        767: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 16,
        },
        576: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 20,
        },
        200: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          cardsPerGridRow: 2,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    case "expand_action_poster":
    case "shorts_roller_poster":
      return {
        1650: {
          slidesPerView: 8,
          slidesPerGroup: 8,
          cardsPerGridRow: 8,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1024: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        920: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        767: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 3,
          cardPaddingGrid: 7,
          gridPadding: 12,
        },
        480: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 12,
          gridPadding: 12,
        },
        320: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 5,
          gridPadding: 12,
        },
      };
    case "roller_poster":
      return {
        1650: {
          slidesPerView: 8,
          slidesPerGroup: 8,
          cardsPerGridRow: 8,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1024: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        920: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        767: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        480: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        320: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    case "icon_poster":
      return {
        1650: {
          slidesPerView: 9,
          slidesPerGroup: 8,
          cardsPerGridRow: 8,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 9,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 11,
          slidesPerGroup: 9,
          cardsPerGridRow: 9,
          cardPaddingGrid: 9,
          gridPadding: 50,
        },
        1024: {
          slidesPerView: 8,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        920: {
          slidesPerView: 7,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        767: {
          slidesPerView: 6.3,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 4.3,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        480: {
          slidesPerView: 3.3,
          slidesPerGroup: 3,
          cardsPerGridRow: 4,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        320: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    case "edge_poster":
      return {
        1536: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 5,
          cardPaddingGrid: 9,
          gridPadding: 50,
        },
        1024: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        920: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 8,
        },
        767: {
          slidesPerView: 4.5,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 4,
        },
        576: {
          slidesPerView: 4.3,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 0,
          gridPadding: 10,
        },
        480: {
          slidesPerView: 4.3,
          slidesPerGroup: 4,
          cardsPerGridRow: 3,
          cardPaddingGrid: 0,
          gridPadding: 0,
        },
        430: {
          slidesPerView: 4.2,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        320: {
          slidesPerView: 3.25,
          slidesPerGroup: 2,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    case "circle_poster":
      return {
        1650: {
          slidesPerView: 12,
          slidesPerGroup: 12,
          cardsPerGridRow: 12,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1520: {
          slidesPerView: 12,
          slidesPerGroup: 12,
          cardsPerGridRow: 12,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 11,
          slidesPerGroup: 11,
          cardsPerGridRow: 11,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 11,
          slidesPerGroup: 11,
          cardsPerGridRow: 11,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1199: {
          slidesPerView: 10,
          slidesPerGroup: 10,
          cardsPerGridRow: 10,
          cardPaddingGrid: 10,
          gridPadding: 23,
        },
        1024: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        991: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        767: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 4,
          gridPadding: 20,
        },
        480: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        200: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    case "square_poster":
      return {
        1650: {
          slidesPerView: 12,
          slidesPerGroup: 12,
          cardsPerGridRow: 12,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 11,
          slidesPerGroup: 11,
          cardsPerGridRow: 11,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 11,
          slidesPerGroup: 11,
          cardsPerGridRow: 11,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1199: {
          slidesPerView: 10,
          slidesPerGroup: 10,
          cardsPerGridRow: 8,
          cardPaddingGrid: 10,
          gridPadding: 23,
        },
        1024: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        991: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        767: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        430: {
          slidesPerView: 3.7,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        200: {
          slidesPerView: 3.525,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    case "expand_roller_poster":
      return {
        1650: {
          slidesPerView: 8,
          slidesPerGroup: 8,
          cardsPerGridRow: 8,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1199: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 23,
        },
        1024: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        991: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        767: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        480: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        200: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };

    case "promo_poster":
      return {
        1650: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1199: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 10,
          gridPadding: 23,
        },
        1024: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        991: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 1,
          gridPadding: 30,
        },
        767: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        480: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        200: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 1,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    case "tag_poster":
      return {
        1650: {
          slidesPerView: "auto",
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: "auto",
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1199: {
          slidesPerView: "auto",
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 23,
        },
        1024: {
          slidesPerView: "auto",
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        767: {
          slidesPerView: "auto",
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 4,
          gridPadding: 16,
        },
        576: {
          slidesPerView: "auto",
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 20,
        },
        200: {
          slidesPerView: "auto",
          slidesPerGroup: 2.1,
          cardsPerGridRow: 2,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };

    case "top10_portrait_poster":
      return {
        1650: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1024: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        920: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        767: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        480: {
          slidesPerView: 3.2,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        320: {
          slidesPerView: 2.2,
          slidesPerGroup: 2,
          cardsPerGridRow: 2,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    case "horizontal_poster": {
      return {
        1650: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1440: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 7,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1024: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        920: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        767: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 30,
        },
        576: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          cardsPerGridRow: 3,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        480: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
        320: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          cardsPerGridRow: 2,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
    }
    default:
      return {
        1650: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          cardsPerGridRow: 6,
          cardPaddingGrid: 7,
          gridPadding: 51,
        },
        1300: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          cardsPerGridRow: 5,
          cardPaddingGrid: 7,
          gridPadding: 48,
        },
        1199: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 23,
        },
        1024: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 7,
          gridPadding: 20,
        },
        767: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          cardsPerGridRow: 4,
          cardPaddingGrid: 4,
          gridPadding: 16,
        },
        576: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          cardsPerGridRow: 3,
          cardPaddingGrid: 4,
          gridPadding: 20,
        },
        200: {
          slidesPerView: 2.1,
          slidesPerGroup: 2.1,
          cardsPerGridRow: 2,
          cardPaddingGrid: 4,
          gridPadding: 12,
        },
      };
  }
}

export function cardsRatio(cardType) {
  switch (cardType) {
    case "sheet_poster":
    case "top10_landscape_poster":
    case "large_poster":
    case "overlay_poster":
    case "network_poster":
    case "expands_poster":
    case "overlayIcon_poster":
    case "content_poster":
    case "custom_poster":
    case "tag_poster":
    case "live_poster":
      return 0.5625;
    case "roller_poster":
    case "shorts_roller_poster":
      return 1.46;
    case "expand_roller_poster":
    case "expand_action_poster":
    case "top10_portrait_poster":
      return 1.5;
    case "icon_poster":
    case "square_poster":
    case "circle_poster":
    case "edge_poster":
    case "horizontal_poster":
      return 1;
    case "promo_poster":
      return 0.15625;
    default:
      return 0.5625;
  }
}

export const getAvaliableCardTypes = () => [
  "sheet_poster",
  "tag_poster",
  "overlay_poster",
  "expand_poster",
  "overlayIcon_poster",
  "network_poster",
  "content_poster",
  "custom_poster",
  "expands_preview_poster",
  "expands_poster",
  "large_poster",
  "icon_poster",
  "circle_poster",
  "square_poster",
  "edge_poster",
  "expand_roller_poster",
  "roller_poster",
  "promo_poster",
  "expand_action_poster",
  "live_poster",
  "top10_landscape_poster",
  "top10_portrait_poster",
  "shorts_roller_poster",
  "horizontal_poster",
];
