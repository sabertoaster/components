const vipPresetData = ["VIP", "Nhất Phẩm", "Nhị Phẩm", "Tam Phẩm", "Tứ Phẩm", "Ngũ Phẩm", "Lục Phẩm", "Thất Phẩm", "Bát Phẩm", "Cửu Phẩm", "Dân "];
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
        this.vipBonusReference = rawData.rv; // just 4 view

        this.onRemoveEventBonus = ()=>{};
    }

    reSortOrder() {
        this.sortedPrice = this.sortLowToHight(this.price);
        this.sortedPriceView = this.sortHighToLow(this.price);
        this.sortedFirstBonus = this.sortHighToLow(this.firstBonus);
        this.sortedOriginCoin = this.sortHighToLow(this.originCoin);
        this.viewOrder = this.getViewOrder();
    }

    // index of origin list in sorted list Price list
    getViewOrder() {
        let viewOrder = [];
        for (let i = 0; i < this.price.length; i++) {
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
    sortLowToHight(originList) {
        return [...originList].sort((a, b) => a - b);
    }

    // tự trừ để đỡ phải call api lấy data lại, cũng ko cần sync time nữa
    removeEventBonus() {
        for (let i = 0; i < this.price.length; i++) {
            this.totalCoin[i] -= this.eventSale.rate * this.price[i];
        }
        this.onRemoveEventBonus();
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
        this.interval = setInterval(() => {
            this.redrawClock();
        }, 1000);
    }

    initData(eventSale) {
        this.eventSale = eventSale;
        if(!eventSale.isEvent)
            clearInterval(this.interval);
    }

    redrawClock() {
        if (this.eventSale == null) return;
        let secondLeft = this.eventSale.endTime  - Date.now()/1000;
        if (secondLeft < 0) {
            this.eventSale.resetRate();
            clearInterval(this.interval);
            return;
        }
        this.txtElement.innerText = this.hms(parseInt(secondLeft));
    }

    hms(seconds) {
        return [3600, 60]
          .reduceRight(
            (p, b) => r => [Math.floor(r / b)].concat(p(r % b)),
            r => [r]
          )(seconds)
          .map(a => a.toString().padStart(2, '0'))
          .join(':');
    }
}

class Carousel {

    constructor(containerElement, itemElementList, delayTime, ignoreIndexList ) {
        this.containerElement = containerElement;
        this.itemElementList = itemElementList;
        this.itemCount = itemElementList.length;
        this.currentItemIndex = 0;
        this.delayTime = delayTime;
        setInterval(() => {
            this.slideNext();
        }, delayTime);
        itemElementList[0].classList.add('active');
        itemElementList[0].classList.remove('inactive');

        this.ignoreIndexList = ignoreIndexList;
    }

    slideNext() {
        let currentItemClassList = this.itemElementList[this.currentItemIndex].classList
        currentItemClassList.add('inactive');
        currentItemClassList.remove('active');
        setTimeout(function() {
            currentItemClassList.remove('inactive');
        }, this.delayTime - 100);
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

class LookupPopup {

    constructor(tabContainer, rowTemplate, table, popupContainer) {
        this.tabList = $(tabContainer).find(".tab");
        this.rowTemplate = rowTemplate; // setting template. Cái này bỏ sang bên class riêng cũng được nhưng ngắn nên ko cần thiết
        // rowTemplate.leftColValue = $(".left-col-value")[0];
        // rowTemplate.rightColValue = $(".right-col-value")[0];
        this.popupContainer = popupContainer;
        this.head1 = $("#head1")[0];
        this.head2 = $("#head2")[0];
        this.table = table;
        const ctx = this;
        for (let i = 0; i < this.tabList.length; i++) {
            this.tabList[i].onclick = () => { ctx.openTab(i) }
        }

    }

    openTab(tabIndex) {
        this.popupContainer.css("display", "block");
        this.tabList.removeClass("active");
        this.tabList[tabIndex].classList.add("active");
        switch (tabIndex) {
            case 0:
                this.initData(i => currentData.sortedPriceView[i] + " VND", i => currentData.sortedOriginCoin[i], Math.min(currentData.sortedPriceView.length, currentData.sortedOriginCoin.length));
                this.head1.innerText = "Mệnh giá";
                this.head2.innerText = "Tỷ lệ";
                break;
            case 1:
                this.initData(i => vipPresetData[i], i => currentData.vipBonusReference[i], vipPresetData.length);
                this.head1.innerText = "Cấp VIP";
                this.head2.innerText = "Tỷ lệ";
                break;
            case 2:
                this.initData(i => "Khuyến mại sự kiện", currentData.eventSale.rate, currentData.eventSale.isEvent ? 1 : 0);
                this.head1.innerText = "Khuyến mại hiện tại";
                this.head2.innerText = "Tỷ lệ";
                break;
            case 3:
                this.initData(i => currentData.sortedPriceView[i] + " VND", i => currentData.sortedFirstBonus[i], Math.min(currentData.sortedPriceView.length, currentData.sortedFirstBonus.length));
                this.head1.innerText = "Mệnh giá";
                this.head2.innerText = "Số bảo nhận được";
                break;

        }
    }

    close() {
        this.popupContainer.css("display", "none");
    }

    initData(getData1, getData2, totalRecord) {
        $(this.table).empty();
        for (let i = 0; i < totalRecord; i++) {
            let record = this.rowTemplate.cloneNode(true);
            $(record).children(".left-col-value")[0].innerText = getData1(i);
            $(record).children(".right-col-value")[0].innerText = getData2(i);
            this.table.appendChild(record);
        }
    }

}

/// coi như đoạn này là ready xong bắt đầu call và có data
var paycardData, paymodData, clock, firstPay = false;
var lookupPopup;
var ignoreBannerIndexList = [];

function onDocumentReady() {

    // đoạn này call đến eventListener
    setEventForButtons();

    // đoạn này call api để lấy data nhưng mà tạm thời hardcode call thẳng
    let data1 = {"m":0,"e":100,"v":[150,150,150,150,150,150,150,150,150],"t":[400,450,350,250,300,300,450,450,450],"b":[65000000,140000000,30000000,5000000,11000000,16500000,210000000,350000000,700000000],"vnd":[100000,200000,50000,10000,20000,30000,300000,500000,1000000],"rd":[400,450,350,250,300,300,450,450,450],"rv":[150,100,90,80,70,60,50,40,30,20,0],"rf":[30000000,30000000,17000000,3000000,7000000,10000000,30000000,30000000,30000000],"p":[[],[],[],[],[],[],[],[],[]],"mm":6,"isv":false,"st":1664298060,"et":1664384340};
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
    onGetPaycardData(data1);
    onGetPaymodData(data2);
    // get data mặc định là data nạp card;

    spawnCard();
    var x = new Carousel($(".top-banner")[0], $(".banner"), 5000, ignoreBannerIndexList);
    lookupPopup = new LookupPopup($(".tab-container"),$(".table-row")[0],$(".row-container")[0],$("#lookup-popup") );

    $(".lookup-close-btn").click(() => { lookupPopup.close() });
    $(".btn-detail").each((idx, elem) => $(elem).click(() => lookupPopup.openTab(idx)));

    let wrapper = $("#wrapper");
    $(".carousel-controller-prev").click(function(){
        wrapper.animate({scrollLeft: wrapper.scrollLeft() - wrapper.width()}, 600);
        console.log(wrapper.scrollLeft() - wrapper.width());
        return false;
    }); 
    $(".carousel-controller-next").click(function(){
        wrapper.animate({scrollLeft: wrapper.scrollLeft() + wrapper.width()}, 600);
        return false;
    }); 

}

var currentData, currentDataIndex = 0,
    currentShowIndex; // HEADER

function onGetPaycardData(data) {
    paycardData = new PaymentData(data);
    paycardData.getDataSet();
    switchToCardTab(); // tab này được bật default sau khi load xong data
    $(".card-UI-btn").css("background-image", "url('resources/nt.png')"); // hình ảnh được bật default
    paycardData.onRemoveEventBonus = ()=>{
        if(ignoreBannerIndexList.indexOf(1) == -1)
            ignoreBannerIndexList.push(1)
}
    if(paycardData.eventSale.isEvent){
        paycardData.countdountClock = new CountdountClock($("#pay-card-clock")[0]);
        paycardData.countdountClock.initData(paycardData.eventSale);
        $("#pay-card-rate")[0].innerText = `+${paycardData.eventSale.rate} Tỷ lệ`;
    }else{
        ignoreBannerIndexList.push(1);
    }
}

function onGetPaymodData(data) {
    paymodData = new PaymentData(data);
    paymodData.getDataSet();
    paymodData.onRemoveEventBonus = ()=>{
        if(ignoreBannerIndexList.indexOf(2) == -1)
            ignoreBannerIndexList.push(2)
}
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
    // clock.initData(paycardData.eventSale);
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
    $(".estimate-money").text(formatNum(data.price) + "VNĐ");
    $(".price-value").find("span").text(formatNum(data.price));
    $(".value-origin").text(formatNum(data.originCoin));
    $(".value-vip").text(formatNum(data.vipBonus));
    $(".value-promo").text(formatNum(data.eventBonus));
    $(".value-first").text(firstPay ? formatNum(data.firstBonus) : 0);

    $(".estimate-coin").each(function(index, element) {
        if (index == 0) {
            $(element).text(formatNum(data.totalCoin));
        } else {
            $(element).find("span").text(formatNum(data.totalCoin));
        }
    });
    $(".cardpay-price-selector").text(formatNum(data.price));
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
        if (currentDataIndex == currentData.price.length - 1) {
            currentDataIndex = 0;
        } else currentDataIndex++;
        loadCurrentData();

    });

    $(".btn-minus").click(function(e) {
        if (currentDataIndex == 0) {
            currentDataIndex = currentData.price.length - 1;
        } else currentDataIndex--;
        loadCurrentData();
    });
}

function loadCurrentData() {
    // console.log(currentDataIndex);
    loadContent(currentData.viewOrder[currentDataIndex]);
}

// LIST-SCREEN

function toggleListScreen(status) {
    if (status) {
        listTabElem.show();
        const slideWrapper = $('#card-container');
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
    var container = document.querySelector("#card-container");

    for (var i = 0; i < nodeNum; i++) {
        clone = node.cloneNode(true);
        container.appendChild(clone);
    }
    $(".card").each(function(index, element) {
        var crossPrice = currentData.getDataSet(index).originCoin,
            ingamePrice = currentData.getDataSet(index).totalCoin,
            realPrice = currentData.getDataSet(index).price;
        $(element).find(".card-cross-price").html(`Gốc: <div class="cross-font">${formatNum(crossPrice)}</div>`);
        $(element).find(".card-ingame-price").text(formatNum(ingamePrice));
        $(element).find(".card-price").text(formatNum(realPrice) + "VNĐ");
    });
}


function formatNum(val) {
    // remove sign if negative
    var sign = 1;
    if (val < 0) {
        sign = -1;
        val = -val;
    }
    let num = val.toString().includes('.') ? val.toString().split('.')[0] : val.toString();
    let len = num.toString().length;
    let result = '';
    let count = 1;

    for (let i = len - 1; i >= 0; i--) {
        result = num.toString()[i] + result;
        if (count % 3 === 0 && count !== 0 && i !== 0) {
            result = '.' + result;
        }
        count++;
    }

    if (val.toString().includes('.')) {
        result = result + '.' + val.toString().split('.')[1];
    }
    return sign < 0 ? '-' + result : result;
}


onDocumentReady();
currentData.getDataSet(0); // HEADER