const vipPresetData = ["VIP", "Nhất Phẩm", "Nhị Phẩm", "Tam Phẩm", "Tứ Phẩm", "Ngũ Phẩm", "Lục Phẩm", "Thất Phẩm", "Bát Phẩm","Cửu Phẩm", "Dân "];
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
        this.delayTime = delayTime;
        setInterval(() => {
            this.slideNext();
        }, delayTime);
        itemElementList[0].classList.add('active');
        itemElementList[0].classList.remove('inactive');

        this.ignoreIndexList = [];
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

class LookupPopup{

    constructor(tabContainer, rowTemplate, table, popupContainer){
        this.tabList = $(tabContainer).find(".tab");
        this.rowTemplate = rowTemplate; // setting template. Cái này bỏ sang bên class riêng cũng được nhưng ngắn nên ko cần thiết
        // rowTemplate.leftColValue = $(".left-col-value")[0];
        // rowTemplate.rightColValue = $(".right-col-value")[0];
        this.popupContainer = popupContainer;
        this.head1 = $("#head1")[0];
        this.head2 = $("#head2")[0];
        this.table =  table;
        const ctx = this;
        for(let i = 0;i<this.tabList.length;i++){
            this.tabList[i].onclick = ()=>{ctx.openTab(i)}
        }
        
    }

    openTab(tabIndex){
        this.popupContainer.css("display","block");
        this.tabList.removeClass("active");
        this.tabList[tabIndex].classList.add("active");
        switch (tabIndex){
            case 0:
                this.initData(i=>currentData.sortedPriceView[i] +" VND",i=>currentData.sortedOriginCoin[i], Math.min(currentData.sortedPriceView.length, currentData.sortedOriginCoin.length));
                this.head1.innerText = "Mệnh giá";
                this.head2.innerText = "Tỷ lệ";
                break;
            case 1:
                this.initData(i=>vipPresetData[i],i=>currentData.vipBonusReference[i], vipPresetData.length);
                this.head1.innerText = "Cấp VIP";
                this.head2.innerText = "Tỷ lệ";
                break;
            case 2:
                this.initData(i=>"Khuyến mại sự kiện",currentData.eventSale.rate, currentData.eventSale.isEvent?1:0);
                this.head1.innerText = "Khuyến mại hiện tại";
                this.head2.innerText = "Tỷ lệ";
                break;
            case 3:
                this.initData(i=>currentData.sortedPriceView[i] +" VND",i=>currentData.sortedFirstBonus[i], Math.min(currentData.sortedPriceView.length, currentData.sortedFirstBonus.length));
                this.head1.innerText = "Mệnh giá";
                this.head2.innerText = "Số bảo nhận được";
                break;
            
        }
    }

    close(){
        this.popupContainer.css("display","none");
    }

    initData(getData1, getData2, totalRecord){
        $(this.table).empty();
        for(let i= 0; i < totalRecord; i++){
            let record = this.rowTemplate.cloneNode(true);
            $(record).children(".left-col-value")[0].innerText  = getData1(i); 
            $(record).children(".right-col-value")[0].innerText  = getData2(i);
            this.table.appendChild(record);
        }
    }

}

/// coi như đoạn này là ready xong bắt đầu call và có data
var paycardData, paymodData, clock, firstPay = false;
var lookupPopup;

function onDocumentReady() {

    // đoạn này call đến eventListener
    setEventForButtons();

    // đoạn này call api để lấy data nhưng mà tạm thời hardcode call thẳng
    let data1 = {
        "m": 0,
        "e": 0,
        "v": [150, 150, 150, 150, 150, 150, 150, 150, 150],
        "t": [400, 450, 350, 250, 300, 300, 450, 450, 450],
        "b": [55000000, 120000000, 25000000, 4000000, 9000000, 13500000, 180000000, 300000000, 600000000],
        "vnd": [100000, 200000, 50000, 10000, 20000, 30000, 300000, 500000, 1000000],
        "rd": [400, 450, 350, 250, 300, 300, 450, 450, 450],
        "rv": [150, 100, 90, 80, 70, 60, 50, 40, 30, 20, 0],
        "rf": [30000000, 30000000, 17000000, 3000000, 7000000, 10000000, 30000000, 30000000, 30000000],
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
        "st": 0,
        "et": 0
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
    var x = new Carousel($(".top-banner")[0], $(".banner"), 2000);
    lookupPopup = new LookupPopup($(".tab-container"),$(".table-row")[0],$(".table-body")[0],$("#lookup-popup") );

    $(".lookup-close-btn").click(()=>{lookupPopup.close()});
    $(".btn-detail").each((idx,elem)=>$(elem).click(()=> lookupPopup.openTab(idx)) );

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
    $(".value-first").text(firstPay ? data.firstBonus : 0);

    $(".estimate-coin").each(function(index, element) {
        if (index == 0) {
            $(element).text(data.totalCoin);
        } else {
            $(element).find("span").text(data.totalCoin);
        }
    });
    $(".cardpay-price-selector").text(data.price);
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
    console.log(currentDataIndex);
    loadContent(currentData.viewOrder[currentDataIndex]);
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