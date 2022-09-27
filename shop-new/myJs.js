const slider = $('#wrapper');
const slideWrapper = $('.panel-container');
let isDown = false;
let startX;
let scrollLeft;
let scrollSpeed = 1; // default speed
slider.mousedown((e) => {
    isDown = true;
    startX = e.pageX - slider.offset().left;
    scrollLeft = slider.scrollLeft();
    slideWrapper.mouseleave(() => {
        $(slideWrapper).off("mousemove");
        $(slideWrapper).off("mouseup");
        $(slideWrapper).off("mouseleave");
        isDown = false;
    });
    slideWrapper.mouseup(() => {
        $(slideWrapper).off("mousemove");
        $(slideWrapper).off("mouseleave");
        $(slideWrapper).off("mouseup");
        isDown = false;
    });
    slideWrapper.mousemove((e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offset().left;
        const walk = (x - startX) * scrollSpeed; //scroll-fast
        slider.scrollLeft(scrollLeft - walk);
    });
});

/* ONCLICK-CARD */

const cards = $(".card");
var totalMouseDistance = 0;
var limitDistance = 20;
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
                currentDataIndex = index;
                loadContent(currentDataIndex);
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

const button = $(".carousel-controller-btn");

// $(button).each(function(index, element) {
//     // element == this
//     $(element).click(function() {
//         console.log(1111111);
//     });
// }); test button clickable