class PaymentData {
    constructor(rawData) {
        this.price = rawData.vnd;
        this.totalCoin = rawData.b;
        this.firstBonus = rawData.rf;
        this.originCoin = rawData.rd;
        this.reSortOrder();
        this.eventSale = new EventSales(rawData);
        var ctx = this;
        this.eventSale.onRateStateChange = function() {
            ctx.removeEventBonus();
        };
        // static data
        this._vipBonus = rawData.v;
        this._vipBonusReference = rawData.rv; // just 4 view
    }

    reSortOrder() {
        this.sortedPrice = this.sortHighToLow(this.price);
        this.sortedFirstBonus = this.sortHighToLow(this.firstBonus);
        this.sortedOriginCoin = this.sortHighToLow(this.originCoin);
        this.viewOrder = this.getViewOrder();
    }

    // index of origin list in sorted list Price list
    getViewOrder() {
        let viewOrder = [];
        for (let i = 0; i < this.sortedPrice.length; i++) {
            viewOrder.push(this.price.indexOf(this.sortedPrice[i]));
        }
        return viewOrder;
    }

    getDataSet(recordIndex) {
        return {
            price: this.price[recordIndex],
            totalCoin: this.totalCoin[recordIndex],
            originCoin: this.originCoin[recordIndex] * this.price[recordIndex],
            vipBonus: this._vipBonus[recordIndex] * this.price[recordIndex],
            eventBonus: this.eventSale.rate * this.price[recordIndex],
            firstBonus: this.firstBonus[recordIndex],
        }
    }

    //clone sort high to low funtion
    sortHighToLow(originList) {
        return [...originList].sort((a, b) => b - a);
    }

    // tự trừ để đỡ phải call api lấy data lại, cũng ko cần sync time nữa
    removeEventBonus() {
        for (let i = 0; i < this.price.length; i++) {
            this.totalCoin[i] -= this.eventSale.rate * this.price[i];
        }
        // làm gì đó với view ở đoạn này. Ví dụ như bỏ hiển thị event bonus đi
    }


}

class EventSales {
    constructor(rawData) {
        this.rate = rawData.e;
        // this.startTime = rawData.st; // don't use
        this.endTime = rawData.et;
        this.onRateStateChange = () => {};
    }

    get isEvent() {
        return this.rate > 0;
    }

    resetRate() {
        if (this.rate != 0) {
            this.onRateStateChange();
            this.rate = 0;
        }
    }
}

class CountdountClock {

    constructor(txtElement) {
        this.txtElement = txtElement;
        setInterval(() => {
            this.redrawClock();
        }, 1000);
    }

    initData(eventSale) {
        this.eventSale = eventSale;
    }

    redrawClock() {
        if (this.eventSale == null) return;
        let milisecondLeft = this.eventSale.endTime * 1000 - Date.now();
        if (milisecondLeft < 0) {
            this.eventSale.resetRate();
            return;
        }
        let leftTime = new Date(milisecondLeft);
        txtElement.innerText = `${leftTime.getUTCHours()}:${leftTime.getUTCMinutes()}:${leftTime.getUTCSeconds()}`;
    }
}

class Carousel {

    constructor(containerElement, itemElementList, delayTime) {
        this.containerElement = containerElement;
        this.itemElementList = itemElementList;
        this.itemCount = itemElementList.length;
        this.currentItemIndex = 0;
        this.setInterval(() => {
            this.slideNext();
        }, delayTime);
        itemElementList[0].classList.add('active');
        itemElementList[0].classList.remove('inactive');
        this.ignoreIndexList = [];
    }

    slideNext() {
        this.itemElementList[this.currentItemIndex].classList.add('inactive');
        this.itemElementList[this.currentItemIndex].classList.remove('active');
        this.currentItemIndex++;
        while (this.ignoreIndexList.indexOf(this.currentItemIndex) != -1) {
            this.currentItemIndex++;
        }
        if (this.currentItemIndex >= this.itemCount) {
            this.currentItemIndex = 0;
        }
        this.itemElementList[this.currentItemIndex].classList.add('active');
        this.itemElementList[this.currentItemIndex].classList.remove('inactive');

    }
}

/// coi như đoạn này là ready xong bắt đầu call và có data
var paycardData, paymodData, clock;

function onDocumentReady() {

    // đoạn này call đến eventListener
    setEventForButtons();

    // đoạn này call api để lấy data nhưng mà tạm thời hardcode call thẳng
    let data1 = {
        "m": 0,
        "e": 100,
        "v": [0, 0, 0, 0, 0, 20, 20, 30, 40],
        "t": [250, 300, 300, 350, 400, 450, 450, 450, 450],
        "b": [6500000, 15000000, 22000000, 39500000, 80000000, 144000000, 201000000, 320000000, 620000000],
        "vnd": [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000],
        "rd": [250, 300, 300, 350, 400, 450, 450, 450, 450],
        "rv": [150, 100, 90, 80, 70, 60, 50, 40, 30, 20, 0],
        "rf": [3000000, 7000000, 10000000, 17000000, 30000000, 30000000, 30000000, 30000000, 30000000],
        "p": [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        "mm": 6,
        "isv": false,
        "st": 1663866060,
        "et": 1663952340
    };
    let data2 = {
        "m": 0,
        "e": 0,
        "v": [0, 0, 0, 0, 0, 20, 20, 30, 40, 50, 60, 90, 100],
        "t": [600, 600, 600, 600, 600, 600, 600, 600, 650, 650, 650, 700, 750],
        "b": [9000000, 19000000, 28000000, 47000000, 90000000, 154000000, 216000000, 345000000, 720000000, 1080000000, 1450000000, 3980000000, 8530000000],
        "vnd": [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000, 1500000, 2000000, 5000000, 10000000],
        "rd": [600, 600, 600, 600, 600, 600, 600, 600, 650, 650, 650, 700, 750],
        "rv": [150, 100, 90, 80, 70, 60, 50, 40, 30, 20, 0],
        "rf": [3000000, 7000000, 10000000, 17000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000],
        "p": [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        "mm": 6,
        "isv": false,
        "st": 0,
        "et": 0
    };
    let clockTxtElement = document.getElementById('clock');
    clock = new CountdountClock(clockTxtElement);
    onGetPaycardData(data1);
    onGetPaymodData(data2);
    // get data mặc định là data nạp card;

    spawnCard();

}

var currentData, currentDataIndex = 0,
    currentShowIndex; // HEADER

function onGetPaycardData(data) {
    paycardData = new PaymentData(data);
    paycardData.getDataSet();
    switchToCardTab(); // tab này được bật default sau khi load xong data
    $(".card-UI-btn").css("background-image", "url('resources/nt.png')"); // hình ảnh được bật default
}

function onGetPaymodData(data) {
    paymodData = new PaymentData(data);
    paymodData.getDataSet();
}

var listTabElem = $(".list-screen"),
    estimateTabElem = $(".estimate-screen"),
    modTabElem, cardTabElem; // HEADER 

// hai function bên dưới là để gán vào hai cái nút chuyển tab. Nhét logic tắt bật tab vào
function switchToCardTab() {
    toggleListScreen(true);
    toggleCardTab(true);
    toggleModTab(false);
    // đặt logic để bật view tab card ở đây
    clock.initData(paycardData.eventSale);
    currentData = paycardData;
}

function switchToModTab() {
    toggleListScreen(false);
    toggleCardTab(false);
    toggleModTab(true);
    // đặt logic để bật view tab mod ở đây
    //
    clock.initData(paymodData.eventSale);
    currentData = paymodData;
    currentDataIndex = 0;
    loadContent(currentDataIndex);
}

// HEADER
function OnBamVao1CaiNgoaiList(IndexCuaCaiDaBamVao) {
    changeScreen(2);

}

// HEADER
function showDataForCurrentIndex() {
    tempElem.innerText = currentData.getDataSet(currentShowIndex); // set cho may gia tri phia trong
}

// HEADER
function changeScreen(screenIndex) {
    if (screenIndex == 1) {
        estimateTabElem.hide();
        listTabElem.show();
    }
    if (screenIndex == 2) {
        listTabElem.hide();
        estimateTabElem.show();
        cardTabElem.show();
        modTabElem.hide();
    }
    if (screenIndex == 3) {
        listTabElem.hide();
        estimateTabElem.show();
        cardTabElem.hide();
        modTabElem.show();
    }
}


function toggleCardTab(status) {
    switch (status) {
        case true:
            $(".card-UI-panel").show();
            break;
        case false:
            $(".card-UI-panel").hide();
            break;
        default:
            break;
    }
}

function toggleModTab(status) {
    switch (status) {
        case true:
            $(".mod-UI-panel").show();
            break;
        case false:
            $(".mod-UI-panel").hide();
            break;
        default:
            break;
    }
}

function loadContent(index) {
    // estimate-coin = bao, estimate-money = vnd
    var data = currentData.getDataSet(index);
    // console.log(data);
    $(".estimate-money").text(data.price);
    $(".price-value").find("span").text(data.price);
    $(".value-origin").text(data.originCoin);
    $(".value-vip").text(data.vipBonus);
    $(".value-promo").text(data.eventBonus);
    $(".value-first").text(data.firstBonus);

    $(".estimate-coin").each(function(index, element) {
        // element == this
        if (index == 0) {
            $(element).text(data.totalCoin);
        } else {
            $(element).find("span").text(data.totalCoin);
        }
    });
}

function setEventForButtons() {
    $(".mod-UI-btn").on("click", function() {
        switchToModTab();
        // set lai data cho cac div o trong


        //
        $(".mod-UI-btn").css("background-image", "url('resources/nM2.png')");
        $(".card-UI-btn").css("background-image", "url('resources/nt2.png')"); // visualize
    });
    $(".card-UI-btn").on("click", function() {
        switchToCardTab();
        $(".mod-UI-btn").css("background-image", "url('resources/nM.png')");
        $(".card-UI-btn").css("background-image", "url('resources/nt.png')"); // visualize
    });


    $(".btn-plus").on("click", function() {
        console.log(currentDataIndex);
        if (currentDataIndex == currentData.price.length - 1) {
            currentDataIndex = 0;
        } else currentDataIndex++;
        loadContent(currentDataIndex);
    });

    $(".btn-minus").click(function(e) {
        e.preventDefault();
        console.log(currentDataIndex);
    });
}

// LIST-SCREEN

function toggleListScreen(status) {
    if (status) {
        listTabElem.show();
        const slideWrapper = $('#wrapper');
        slideWrapper.scrollLeft(0);
        estimateTabElem.hide();
    } else {
        listTabElem.hide();
        estimateTabElem.show();
    }
}

function spawnCard() {
    var nodeNum = paycardData.price.length - 2;
    var node = document.getElementsByClassName("card")[1];
    var clone;
    var container = document.querySelector("#wrapper");

    for (var i = 0; i < nodeNum; i++) {
        clone = node.cloneNode(true);
        container.appendChild(clone);
    }
    $(".card").each(function(index, element) {
        var crossPrice = currentData.getDataSet(index).originCoin,
            ingamePrice = currentData.getDataSet(index).totalCoin,
            realPrice = currentData.getDataSet(index).price;
        $(element).find(".card-cross-price").text(crossPrice);
        $(element).find(".card-ingame-price").text(ingamePrice);
        $(element).find(".card-price").text(realPrice);
    });
}



onDocumentReady();
currentData.getDataSet(0); // HEADER