var Datastore = require('nedb');
db = {};
db.mr = new Datastore({
    filename: __dirname + '/mr.json',
    autoload: true
});
db.purchase = new Datastore({
    filename: __dirname + '/purchase.json',
    autoload: true
});
db.sales = new Datastore({
    filename: __dirname + '/sales.json',
    autoload: true
});


//sample variables....................................................................
var buyamt = 0;
var today = new Date();
today.setHours(0, 0, 0, 0);
var mrsamp = {
    mrdate: today,
    kgrate: 0,
    norate: 0,
    mrd: today
};
var purchasesamp = {
    pdate: today.getDate(),
    kg: 0,
    no: 0,
    amount: 0,
    pd: today
};
var salessamp = {
    sdate: today.getDate(),
    bprice: 0,
    oexpense: 0,
    sprice: 0,
    profit: 0,
    pdate: [],
    kg: [],
    no: [],
    sd: today
};

//functions...........................................................................
function insertmr() {
    var tdate = document.getElementById('mr-date').value;

    if ((document.getElementById('rate-kg').value.length === 0) || (document.getElementById('rate-no').value.length === 0) || (document.getElementById('mr-date').value.length === 0)) {
        //print----------------------------------------------------------------
        $("#mrmsg").addClass("alert-info");
        $("#mrmsg").html('<strong>info!</strong>&nbsp&nbspFill all fields');
    } else {
        db.mr.update({
            mrdate: tdate
        }, {
            $set: {
                mrdate: tdate,
                mrd: Date.parse(tdate),
                kgrate: parseInt(document.getElementById('rate-kg').value, 10),
                norate: parseInt(document.getElementById('rate-no').value, 10),
                //percent: parseInt(document.getElementById('percent-sale').value, 10)
                // NOTE: percent taken to sales directly
            }
        }, {
            upsert: true
        }, function(err, numReplaced, upsert) {
            //console.log(upsert,numReplaced);

            db.mr.loadDatabase(); //used to reload th DB to confirm the update operation

            $(document).ready(function() {
              $("#mrmsg").removeClass("alert-success alert-info");
              $("#mrmsg").html("");
                $("#mrmsg").addClass("alert-success");
                $("#mrmsg").html('<strong>success!</strong>&nbsp&nbspMarket rate inserted');
            });

        });
    }
}

function insertpurchase() {

    var psdate = document.getElementById('purchasedate').value;
    var quantity = document.getElementById('qty').value;
    var kgv = 0,
        nov = 0,
        am = 0;
    var fla = false;
    if (psdate.length === 0 || quantity.length === 0) {
        //print msg------------------------------------------------------------------
        $("#purchasemsg").addClass("alert-info");
        $("#purchasemsg").html('<strong>info!</strong>&nbsp&nbspFill purchase date and quantity fields.');
    } else {
        db.mr.findOne({
            mrdate: psdate
        }, function(err, doc) {
            if (doc == null) {
                //print msg fill the mr rate;
                // console.log(doc,typeof(doc));
                fla = true;
                $("#purchasemsg").addClass("alert-info");
                $("#purchasemsg").html('<strong>info!</strong>&nbsp&nbspInsert the market rate.');

            } else {
                fla = false;
                if (document.getElementById('pr1').checked) {
                    $(document).ready(function() {
                        kgv = quantity;
                        am = quantity * (doc.kgrate / 3);
                        am = am/100;
                      // NOTE: new edit divide am by 100 to change fraction !
                        $("#amount").val(am);
                        nov = 0.0;
                    });

                    //amount.innerHTML=(quantity*doc.kgrate);

                } else if (document.getElementById('pr2').checked) {
                    //amount.innerHTML=(quantity*doc.norate);
                    $(document).ready(function() {
                        nov = quantity;
                        am = quantity * doc.norate;
                        $("#amount").val(am);
                        kgv = 0.0;
                    });

                } else {
                    //print msg-------------------------------------------------------------
                    $("#purchasemsg").addClass("alert-info");
                    $("#purchasemsg").html('<strong>info!</strong>&nbsp&nbspPlease select Kg/Number.');

                }
            }
            if (fla == true) {
                //print insert market rate
            } else {
                //  console.log(fla);
                db.purchase.findOne({
                    pdate: psdate
                }, function(err, doc) {
                    if (doc === null) {

                        purchasesamp.pdate = psdate;
                        purchasesamp.pd = Date.parse(psdate);
                        purchasesamp.kg = parseInt(kgv, 10);
                        purchasesamp.no = parseInt(nov, 10);
                        purchasesamp.amount = parseInt(am, 10);

                        db.purchase.insert(purchasesamp);
                    } else {


                        db.purchase.update({
                            pdate: psdate
                        }, {
                            $set: {
                                pdate: psdate,
                                pd: Date.parse(psdate),
                                kg: (doc.kg + parseInt(kgv, 10)),
                                no: (doc.no + parseInt(nov, 10)),
                                amount: (doc.amount + parseInt(am, 10))
                            }
                        }, {}, function(err1, numReplaced) {
                            db.purchase.loadDatabase();

                        });
                    }
                    $("#purchasemsg").removeClass("alert-success alert-info");
                    $("#purchasemsg").html("");

                    $("#purchasemsg").addClass("alert-success");
                    $("#purchasemsg").html('<strong>success!</strong>&nbsp&nbspPurchased details inserted.');
                    $("#qty").attr("placeholder", "recent quantity:" + quantity);
                    $("#qty").val(null);


                });
            }
        });


    }

}

function addconsumption() {
    var cdate = document.getElementById('purchasedate-in-sales').value;
    var quanti = document.getElementById('qtyconsumed-in-sales').value;
    if (cdate.length === 0 || quanti.length === 0) {
        $("#qtyerrinsales").addClass("alert-info");
        $("#qtyerrinsales").html('<strong>info!</strong>&nbsp&nbspFill purchase date and quantity fields.');

    } else {
        db.purchase.findOne({
            pdate: cdate
        }, function(err1, doc1) {
            if (doc1 == null) {
                $("#qtyerrinsales").addClass("alert-info");
                $("#qtyerrinsales").html('<strong>info!</strong>&nbsp&nbspThere is no purchase on the given date.');

            } else {
                $("#qtyerrinsales").removeClass("alert-info");
                $("#qtyerrinsales").html("");
                db.mr.findOne({
                    mrdate: cdate
                }, function(err, doc) {
                    if (doc == null) {
                        $("#qtyerrinsales").addClass("alert-info");
                        $("#qtyerrinsales").html('<strong>info!</strong>&nbsp&nbspInsert the market rate,or there is no purchase on given date.');

                    } else {
                        if (document.getElementById('sr1').checked) {
                            buyamt += quanti * ((doc.kgrate / 3)/100);//NOTE:divide by 100 to change the fraction position
                            salessamp.pdate[salessamp.pdate.length] = doc.mrdate;
                            salessamp.kg[salessamp.kg.length] = parseInt(quanti, 10);
                            salessamp.no[salessamp.no.length] = parseInt(0, 10);
                            $("#cumulate-entry").text("Total purchase amount:" + buyamt);
                            $("#qtyconsumed-in-sales").attr("placeholder", "recent quantity:" + quanti);
                            $("#qtyconsumed-in-sales").val(null);
                        } else if (document.getElementById('sr2').checked) {
                            buyamt += quanti * doc.norate;
                            salessamp.pdate[salessamp.pdate.length] = doc.mrdate;
                            salessamp.kg[salessamp.kg.length] = parseInt(0, 10);
                            salessamp.no[salessamp.no.length] = parseInt(quanti, 10);
                            $("#cumulate-entry").text("Total purchase amount:" + buyamt);
                            $("#qtyconsumed-in-sales").attr("placeholder", "recent quantity:" + quanti);
                            $("#qtyconsumed-in-sales").val(null);
                        } else {
                            $("#qtyerrinsales").addClass("alert-info");
                            $("#qtyerrinsales").html('<strong>info!</strong>&nbsp&nbspPlease select Kg/Number.');

                        }
                    }
                });
            }

        });

    }
}

function insertsales() {
    var saledate = document.getElementById('sold-on-date').value;
    var percent = document.getElementById('percent-sale').value;
    if (saledate.length === 0 || buyamt === 0||percent.length===0) {
        $("#soldpriceerr").addClass("alert-info");
        $("#soldpriceerr").html('<strong>info!</strong>&nbsp&nbspFill sold on date field or percentage field or consumed details.');
    } else {
        db.mr.findOne({
            mrdate: saledate
        }, function(err, doc) {
            if (doc == null) {
                $("#soldpriceerr").addClass("alert-info");
                $("#soldpriceerr").html('<strong>info!</strong>&nbsp&nbspFill the market rate fields.');

            } else {
                var totkg = 0,
                    totno = 0;
                for (var i = 0; i < salessamp.kg.length; i++) {
                    totkg += salessamp.kg[i];
                    totno += salessamp.no[i];
                }
                //console.log(totkg,totno);
                salessamp.sprice = totkg * doc.kgrate;
                salessamp.sprice += totno * doc.norate;
// TODO: add percent to sale db
                salessamp.sprice = (salessamp.sprice * percent) / 100;
                $("#sold-price").val(salessamp.sprice);

                salessamp.oexpense = document.getElementById('other-expense').value;
                if (salessamp.oexpense == "") {
                    salessamp.oexpense = parseInt(0, 10);
                } else {
                    salessamp.oexpense = parseInt(salessamp.oexpense, 10);
                }
                //console.log(salessamp.oexpense,typeof(salessamp.oexpense));
                salessamp.bprice = buyamt;
                salessamp.profit = salessamp.sprice - (buyamt + salessamp.oexpense);
                $("#today-profit").val(salessamp.profit);
                db.sales.findOne({
                    sdate: saledate
                }, function(err, doc) {
                    if (doc === null) {
                        salessamp.sdate = saledate;
                        salessamp.sd = Date.parse(saledate);
                        //  console.log(salessamp);
                        db.sales.insert(salessamp, function(err, newDoc) {

                        });
                        for (var i = 0; i < salessamp.kg.length; i++) {
                            db.sales.update({
                                sdate: saledate
                            }, {
                                $push: {
                                    pdate: salessamp.pdate[i],
                                    kg: salessamp.kg[i],
                                    no: salessamp.no[i]
                                }
                            }, {}, function() {

                            });
                        }

                        db.sales.loadDatabase();
                    } else {
                        doc.pdate = doc.pdate.concat(salessamp.pdate);
                        doc.kg = doc.kg.concat(salessamp.kg);
                        doc.no = doc.no.concat(salessamp.no);
                        db.sales.update({
                            sdate: saledate
                        }, {
                            $set: {
                                sdate: saledate,
                                sd: Date.parse(saledate),
                                bprice: (doc.bprice + salessamp.bprice),
                                oexpense: (doc.oexpense + salessamp.oexpense),
                                sprice: (doc.sprice + salessamp.sprice),
                                profit: (doc.profit + salessamp.profit),
                                pdate: doc.pdate,
                                kg: doc.kg,
                                no: doc.no
                            }
                        }, {}, function(err1, numReplaced) {
                            db.sales.loadDatabase();
                        });
                    }
                    $("#soldpriceerr").removeClass("alert-success alert-info");
                    $("#soldpriceerr").html("");
                    $("#salesmsg").addClass("alert-success");
                    $("#salesmsg").html('<strong>success!</strong>&nbsp&nbspSales details inserted.');
                    buyamt = 0;
                    salessamp.pdate = [];
                    salessamp.kg = [];
                    salessamp.no = [];
                });
            }

        });

    }
    db.sales.loadDatabase();

}

function showsummary() {

    var fromd = document.getElementById('from-date').value;
    var tod = document.getElementById('to-date').value;
    $("#dateerr").removeClass("alert-info");
    $("#dateerr").html("");
    if (fromd.length === 0 || tod.length === 0) {

        $("#dateerr").addClass("alert-info");
        $("#dateerr").html('<strong>info!</strong>&nbsp&nbsp select the date fields.');
    } else if (Date.parse(fromd) <= Date.parse(tod)) {

        db.sales.find({
            $and: [{
                sd: {
                    $gte: Date.parse(fromd)
                }
            }, {
                sd: {
                    $lte: Date.parse(tod)
                }
            }]
        }, function(err, docs) {
            //console.log(docs,err);
            var x, bp = 0,
                sp = 0;
            for (x in docs) {
                //  console.log(docs[x].bprice);
                sp += docs[x].profit;
                bp += (docs[x].bprice + docs[x].oexpense);
            }
            $("#expenseview").text("Total EXPENSE during this date: " + bp);
            $("#profitview").text("Total PROFIT during this date: " + sp);
            var sarray = ["Date", "Buy amount", "Sold amount", "Other expenses", "Profit"];
            var iarray = ["sdate", "bprice", "sprice", "oexpense", "profit"];
            ///testiiiiiiiinggggggggg
            $("#box").html("");
            $("#box").html("<h3>Sales  Details</h3>");
            mytable = $('<table></table>').attr({
                id: "basicTable",
                class: "table table-hover"
            });
            var rows = new Number(docs.length);
            var cols = new Number(5);
            var tr = [];

            for (var i = -1; i < rows; i++) {
                var row = $('<tr></tr>').attr({
                    class: ["class1"].join(' ')
                }).appendTo(mytable);
                if (i == -1) {
                    for (var j = 0; j < cols; j++) {
                        $('<th></th>').text(sarray[j]).attr({
                            class: ["info"]
                        }).appendTo(row);
                    }
                } else {
                    for (var j = 0; j < cols; j++) {
                        $('<td></td>').text(docs[i][iarray[j]]).appendTo(row);
                    }
                }
            }

            mytable.appendTo("#box");

            ////testiiiiiiiinggggggggg


        });
        db.purchase.find({
            $and: [{
                pd: {
                    $gte: Date.parse(fromd)
                }
            }, {
                pd: {
                    $lte: Date.parse(tod)
                }
            }]
        }, function(err, docs1) {
            ///testiiiiiiiinggggggggg
            var parray = ["Date", "Kg(qty)", "No(qty)", "Amount"];
            var piarray = ["pdate", "kg", "no", "amount"];
            $("#box1").html("");
            $("#box1").html("<h3>Purchase  Details</h3>");
            mytable1 = $('<table></table>').attr({
                id: "basicTable1",
                class: "table table-hover"
            });
            var rows = new Number(docs1.length);
            var cols = new Number(4);
            var tr = [];

            for (var i = -1; i < rows; i++) {
                var row = $('<tr></tr>').attr({
                    class: ["class1"].join(' ')
                }).appendTo(mytable1);
                if (i == -1) {
                    for (var j = 0; j < cols; j++) {
                        $('<th></th>').text(parray[j]).attr({
                            class: ["danger"]
                        }).appendTo(row);
                    }
                } else {
                    for (var j = 0; j < cols; j++) {
                        $('<td></td>').text(docs1[i][piarray[j]]).appendTo(row);
                    }
                }
            }

            mytable1.appendTo("#box1");

            ////testiiiiiiiinggggggggg

        });

    } else {

        $("#dateerr").addClass("alert-info");
        $("#dateerr").html('<strong>info!</strong>&nbsp&nbsp invalid selection.');
    }

}

function showsettings() {
    var deldate = document.getElementById('deletedate').value;
    $("#box2").html("");
    $("#deletemsg").removeClass("alert-success alert-info");
    $("#deletemsg").html("");
    if (deldate.length === 0) {

        $("#deletemsg").addClass("alert-info");
        $("#deletemsg").html('<strong>info!</strong>&nbsp&nbspSelect the date.');
    } else {
        if (document.getElementById('sd1').checked) {
            db.sales.findOne({
                sdate: deldate
            }, function(err, doc) {
                if (doc === null) {

                    $("#deletemsg").addClass("alert-info");
                    $("#deletemsg").html('<strong>info!</strong>&nbsp&nbspNo sales found on this date.');

                } else {

                    ///testiiiiiiiinggggggggg
                    var sarray = ["Date", "Buy amount", "Sold amount", "Other expenses", "Profit"];
                    var iarray = ["sdate", "bprice", "sprice", "oexpense", "profit"];

                    $("#box2").html("");
                    $("#box2").html('<h3>Sales Data</h3><button type="button" class="btn  btn-danger" onclick="deldel()">Delete !</button>');
                    mytable = $('<table></table>').attr({
                        id: "basicTable",
                        class: "table table-hover"
                    });
                    var rows = new Number(1);
                    var cols = new Number(5);
                    var tr = [];

                    for (var i = -1; i < rows; i++) {
                        var row = $('<tr></tr>').attr({
                            class: ["class1"].join(' ')
                        }).appendTo(mytable);
                        if (i == -1) {
                            for (var j = 0; j < cols; j++) {
                                $('<th></th>').text(sarray[j]).attr({
                                    class: ["info"]
                                }).appendTo(row);
                            }
                        } else {
                            for (var j = 0; j < cols; j++) {
                                $('<td></td>').text(doc[iarray[j]]).appendTo(row);
                            }
                        }
                    }

                    mytable.appendTo("#box2");

                    ////testiiiiiiiinggggggggg


                }
            });
        } else if (document.getElementById('sd2').checked) {
            db.purchase.findOne({
                pdate: deldate
            }, function(err, doc) {
                if (doc === null) {

                    $("#deletemsg").addClass("alert-info");
                    $("#deletemsg").html('<strong>info!</strong>&nbsp&nbspNo puchase on this date.');

                } else {
                    ///testiiiiiiiinggggggggg
                    var parray = ["Date", "Kg(qty)", "No(qty)", "Amount"];
                    var piarray = ["pdate", "kg", "no", "amount"];
                    $("#box2").html("");
                    $("#box2").html('<h3>Purchase  Data</h3><button type="button" class="btn  btn-danger" onclick="deldelpur()">Delete !</button>');
                    mytable1 = $('<table></table>').attr({
                        id: "basicTable1",
                        class: "table table-hover"
                    });
                    var rows = new Number(1);
                    var cols = new Number(4);
                    var tr = [];

                    for (var i = -1; i < rows; i++) {
                        var row = $('<tr></tr>').attr({
                            class: ["class1"].join(' ')
                        }).appendTo(mytable1);
                        if (i == -1) {
                            for (var j = 0; j < cols; j++) {
                                $('<th></th>').text(parray[j]).attr({class: ["danger"]}).appendTo(row);
                            }
                        } else {
                            for (var j = 0; j < cols; j++) {
                                $('<td></td>').text(doc[piarray[j]]).appendTo(row);
                            }
                        }
                    }

                    mytable1.appendTo("#box2");

                    ////testiiiiiiiinggggggggg

                }
            });
        } else {

            $("#deletemsg").addClass("alert-info");
            $("#deletemsg").html('<strong>info!</strong>&nbsp&nbspSelect any option.');

        }
    }
}

function deldel() {
    var delval = document.getElementById('deletedate').value;
    db.sales.remove({
        sd: Date.parse(delval)
    }, {}, function(err, numRemoved) {
        // numRemoved = 1

        $("#deletemsg").addClass("alert-success");
        $("#deletemsg").html('<strong>info!</strong>&nbsp&nbspselected entry deleted.');

    });
    db.sales.loadDatabase();
    $("#box2").html("");
}

function deldelpur() {
    var delval = document.getElementById('deletedate').value;
    db.purchase.remove({
        pd: Date.parse(delval)
    }, {}, function(err, numRemoved) {

        $("#deletemsg").addClass("alert-success");
        $("#deletemsg").html('<strong>info!</strong>&nbsp&nbspselected entry deleted.');

    });
    db.purchase.loadDatabase();
    $("#box2").html("");
}
//jquery functions....................................................................
$(document).ready(function() {
    $("#mr-date").focus(function() {
        $("#mrmsg").removeClass("alert-success alert-info");
        $("#mrmsg").html("");
        $("#rate-kg").val(null);
        $("#rate-no").val(null);

    });

    $("#mr-date").change(function() {

        db.mr.findOne({
            mrdate: document.getElementById('mr-date').value
        }, function(err, doc) {
            if (doc === null) {
                $("#rate-kg").val(null);
                $("#rate-no").val(null);
                //$("#percent-sale").val(null);
            } else {

                $("#rate-kg").val(doc.kgrate);
                $("#rate-no").val(doc.norate);
                //$("#percent-sale").val(doc.percent);
            }
        });
    });

    $("#purchasedate").focus(function() {
        $("#purchasemsg").removeClass("alert-success alert-info");
        $("#purchasemsg").html("");
        $("#qty").val(null);
        $("#amount").val(null);
        $("#keynote").val(null);
        $("#qty").attr("placeholder", "enter the quantity of goods");
    });
    $("#purchasedate-in-sales").focus(function() {
        $("#qtyerrinsales").removeClass("alert-info alert-success");
        $("#qtyerrinsales").html("");
        $("#qtyconsumed-in-sales").attr("placeholder", "enter the quantity of goods consumed.");
    });
    $("#sold-on-date").focus(function() {
        $("#soldpriceerr").removeClass("alert-info alert-success");
        $("#soldpriceerr").html("");
        $("#salesmsg").removeClass("alert-info alert-success");
        $("#salesmsg").html("");
        $("#other-expense").val(null);
        $("#sold-price").val(null);
        $("#percent-sale").val(null);
    });
    $("#from-date").focus(function() {
        $("#dateerr").removeClass("alert-info");
        $("#dateerr").html("");
    });
    $("#deletedate").focus(function() {
      $("#deletemsg").removeClass("alert-success alert-info");
      $("#deletemsg").html("");

    });
});
