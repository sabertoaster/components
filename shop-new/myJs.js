/* SCROLL CARD-LIST */

// const slider = $('#wrapper');
// const slideWrapper = $('.panel-container');
// let isDown = false;
// let startX;
// let scrollLeft;
// let scrollSpeed = 1; // default speed
// slider.mousedown((e) => {
//     console.log(111111);
//     isDown = true;
//     startX = e.pageX - slider.offset().left;
//     scrollLeft = slider.scrollLeft();
//     slideWrapper.mouseleave(() => {
//         $(slideWrapper).off("mousemove");
//         $(slideWrapper).off("mouseup");
//         $(slideWrapper).off("mouseleave");
//         isDown = false;
//     });
//     slideWrapper.mouseup(() => {
//         $(slideWrapper).off("mousemove");
//         $(slideWrapper).off("mouseleave");
//         $(slideWrapper).off("mouseup");
//         isDown = false;
//     });
//     slideWrapper.mousemove((e) => {
//         if (!isDown) return;
//         e.preventDefault();
//         const x = e.pageX - slider.offset().left;
//         const walk = (x - startX) * scrollSpeed; //scroll-fast
//         slider.scrollLeft(scrollLeft - walk);
//     });
// });



/* ONCLICK-CARD */

const cards = $(".card");
var totalMouseDistance = 0;
var limitDistance = 40;
var lastSeenAt = {
    x: null,
    y: null
};

$(cards).each(function(index, element) {
    $(element).mousedown(function() {
        $(document).mousemove(clickEventHandle);
        $(document).mouseup(function() {
            if (totalMouseDistance <= limitDistance) {
                // after click functions here
                toggleListScreen(false);
                console.log(index);
                currentDataIndex = currentData.viewOrder.indexOf(index);
                loadCurrentData();
            }
            totalMouseDistance = 0;
            $(document).off("mousemove");
            $(document).off("mouseup");
        });
    });
});


function clickEventHandle(event) {
    if (lastSeenAt.x) {
        totalMouseDistance += Math.sqrt(Math.pow(lastSeenAt.y - event.clientY, 2) + Math.pow(lastSeenAt.x - event.clientX, 2));
    }
    lastSeenAt.x = event.clientX;
    lastSeenAt.y = event.clientY;
}

/* SLIDE LOOKUP*/
const sliderLookup = $('.table-body');
const slideWrapperLookup = $('.panel-container');
let isDownLookup = false;
let startYLookup;
let scrollLeftLookup;
let scrollSpeedLookup = 1; // default speed
$(sliderLookup).mousedown((e) => {
    isDownLookup = true;
    startYLookup = e.pageY - sliderLookup.offset().up;
    scrollLeftLookup = sliderLookup.scrollTop();
    slideWrapperLookup.mouseleave(() => {
        $(slideWrapperLookup).off("mousemove");
        $(slideWrapperLookup).off("mouseup");
        $(slideWrapperLookup).off("mouseleave");
        isDownLookup = false;
    });
    slideWrapperLookup.mouseup(() => {
        $(slideWrapperLookup).off("mousemove");
        $(slideWrapperLookup).off("mouseleave");
        $(slideWrapperLookup).off("mouseup");
        isDownLookup = false;
    });
    slideWrapperLookup.mousemove((e) => {
        if (!isDownLookup) return;
        e.preventDefault();
        const y = e.pageY - sliderLookup.offset().up;
        const walk = (y - startYLookup) * scrollSpeedLookup; //scroll-fast
        sliderLookup.scrollTop(scrollLeftLookup - walk);
    });
});

currentData.reSortOrder();
var dropdownData = [];
for (var i = 0; i < currentData.sortedPrice.length; i++) {
    dropdownData.push({
        "id": currentData.sortedPrice[i],
        "text": formatNum(currentData.sortedPrice[i]) + " VNĐ"
    });
}
console.log(dropdownData);
var priceSelectBox;
$(document).ready(function() {
    var $disabledResults = $(".js-example-disabled-results");
    priceSelectBox = $disabledResults.select2({
        minimumResultsForSearch: -1,
        width: '100%',
        height: '100%',
        data: dropdownData
    })
    priceSelectBox.change(()=>{
        let dataIndex = currentData.sortedPrice.indexOf(parseInt(priceSelectBox.val()));
        if(dataIndex == -1)
            return;
        currentDataIndex = dataIndex;
        loadCurrentData();
    })
    
});