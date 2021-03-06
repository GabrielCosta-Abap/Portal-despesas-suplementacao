sap.ui.define(["sap/ui/core/mvc/Controller",
 "sap/ui/core/Core", 
 "sap/ui/layout/HorizontalLayout", 
 "sap/ui/layout/VerticalLayout",
  "sap/m/Dialog", 
  "sap/m/DialogType",
   "sap/m/Button", 
   "sap/m/ButtonType", 
   "sap/m/Label", 
   "sap/m/Select", 
   "sap/m/SelectDialog"
, "sap/m/MessageToast",
 "sap/m/Text",
  "sap/m/TextArea",
   "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter", 
	"sap/ui/model/FilterOperator"], function (e, t, a, n, p, u, o, s, l, i, m, r, v, y, T, I, c) {
    "use strict";
    return e.extend("queroquerons.suplementacao.controller.Remanejamen", {
        oRoute: null,
        onInit: function () {
            this.oRoute = this.getOwnerComponent().getRouter()
            var e = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                useBatch: false
            });
            this.getView().setModel(e);
            sap.ui.getCore().setModel(e);
            this.globalView = this.getView();
            //this.processTable();
            this.curLineSpath = ""
            this.currentField = ""
            var a = this.getRouter().getRoute("RouteRemanej");
            a.attachPatternMatched(this.onPatternMatched, this)
        },

        onPatternMatched(e) {
      var id = e.getParameters().arguments.id;
      this.IdUser = id;
            if (this.getView().getModel("RemanejModel") != undefined) {
                this.getView().getModel("RemanejModel").getData().RemanejSet = [];
                this.getView().getModel("RemanejModel").updateBindings();
        this.getView().byId("btnRemanejCanc").setVisible(false);
        this.getView().byId("btnRemanejSalvar").setEnabled(true);
            }
      if(sap.ui.getCore().getModel("oScreenModel") != undefined){
        if(sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet.Zpdsol == undefined){
          this.processTable();
          this.getView().byId("inputTotalOrcamentoReman").setValue(0);
          this.Action = "1";
          this.getView().byId("formItensRemanej").setTitle("Inserir nova solicita????o");
          this.getView().byId("btnRemanejCanc").setVisible(false)
          this.getView().byId("btnRemanejSalvar").setEnabled(true);

        }
        else{
          this.getDataUpdate();
          this.Action = "2";
        }
      }
      else{
                this.processTable();
      }
        },

    getDataUpdate: function(){
      var data = sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet;
      if(data.ScreenEnabled){
        this.getView().byId("btnRemanejSalvar").setEnabled(true);
        this.getView().byId("btnRemanejCanc").setEnabled(true);
      }
      else{
        this.getView().byId("btnRemanejSalvar").setEnabled(false);
        this.getView().byId("btnRemanejCanc").setEnabled(false);
      }

      var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                    useBatch: false
                });

      oServiceModel.setHeaders({
        "X-Requested-With": "X"
      })
      var aFilters = [];
      var oFilter = new sap.ui.model.Filter("Zpdsol",
                sap.ui.model.FilterOperator.EQ,
                data.Zpdsol);
            aFilters.push(oFilter);
      oFilter = new sap.ui.model.Filter("Zpdnum",
                sap.ui.model.FilterOperator.EQ,
                data.Zpdnum);
            aFilters.push(oFilter);

      oServiceModel.read("/OrcamentoItemSet", {
        async: true,
        filters: aFilters,
        success: function (oData) {
          if( oData.results.length == 0){
            sap.m.MessageToast.show(`Itens n??o dispon??veis para consulta. Verifique etapa de aprova????o`);
          }
          else{
            var statAprov = oData.results[0].As1st;
            if(statAprov != undefined && statAprov != 'P'){
              if(data.ScreenEnabled){
                data.ScreenEnabled = false;
                this.getView().byId("btnRemanejSalvar").setEnabled(false);
                this.getView().byId("btnRemanejCanc").setEnabled(false);
                var modelLine = sap.ui.getCore().getModel("oScreenModel");
                modelLine.getData().ScreenSet.ScreenEnabled = false;
                modelLine.updateBindings();
                sap.m.MessageToast.show(`Itens n??o dispon??veis para altera????o porque o processo de Aprova????o j?? foi iniciado`);
                sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet.ScreenEnabled = false;
                sap.ui.getCore().getModel("oScreenModel").updateBindings();
              }
              else{
                this.getView().byId("btnRemanejSalvar").setEnabled(true);
                this.getView().byId("btnRemanejCanc").setEnabled(true);
              }
            }
            this.getView().byId("formItensRemanej").setTitle("Alterar dados solicita????o " + sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet.Zpdsol)
            this.getView().byId("btnRemanejCanc").setVisible(true)
            for (var i = 0; i < oData.results.length; i++) {

              oData.results[i].Bldat =  oData.results[i].Cpudt;
              oData.results[i].ScreenEnabled =  data.ScreenEnabled;
              oData.results[i].Buzei =  parseInt(oData.results[i].Buzei);
              oData.results[i].Wrbtr =  Intl.NumberFormat("pt-br", {
                  style: "currency",
                  currency: "BRL"
                }).format(oData.results[i].Wrbtr).replace("R$", "").replace("??", "");
              }

              this.RemanejModel = new sap.ui.model.json.JSONModel({
                RemanejSet: oData.results
              });
              this.RemanejModel.setDefaultBindingMode("TwoWay");
              this.RemanejModel.updateBindings();
              this.getView().setModel(this.RemanejModel, "RemanejModel");
              sap.ui.getCore().setModel(this.RemanejModel, "RemanejModel");

              var newValue = 0
              for (var i = 0; i < oData.results.length; i++) {
                newValue = newValue + Number(oData.results[i].Wrbtr.replaceAll(".", "").replace(",", "."));
              }
              newValue = Intl.NumberFormat("pt-br", {
                style: "currency",
                currency: "BRL"
              }).format(newValue).replace("R$", "").replace("??", "");
              this.getView().byId("inputTotalOrcamentoReman").setValue(newValue);
            }
        }.bind(this),
        error: function (evt) {
        }
      });
    },

    onRemoveLine: function (e) {
      var index = e.oSource.oPropagatedProperties.oBindingContexts.RemanejModel.sPath.split("/")[2];
      this.getView().getModel("RemanejModel").getData().RemanejSet.splice(parseInt(index),1);
      this.getView().getModel("RemanejModel").updateBindings();
      if(this.getView().getModel("RemanejModel").getData().RemanejSet.length == 0){
        this.onAddNewLine()
      }
    },

    processarCancelamento: function(oText, dialog){
      var userCur = sap.ui.getCore().getModel("oUserModel").getData().UserSet.USER;
      userCur = "" || userCur.replace( /^\D+/g, '');
      if(userCur == null || userCur == undefined){
        userCur = this.IdUser
      }
      userCur = "" || userCur.replaceAll("/", "");
      var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                useBatch: false
            });

      oServiceModel.setHeaders({
          "X-Requested-With": "X"
      });

      var LiberacoesSet = {
                "Zpdsol": sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet.Zpdsol,
                "User": userCur,
        "Justificativa": oText
      };

      oServiceModel.create("/OrcamentoCancelarSet", LiberacoesSet, {
          success: function (oData, oResponse) {
            if(oData.Message != undefined && oData.Message != ''){
              sap.m.MessageToast.show(oData.Message + '.Libera????o n??o efetuada.')
            }
            else{
              sap.m.MessageToast.show(`Opera????o efetuada com sucesso`);
              if (dialog != undefined){
                dialog.close();
              }
              setTimeout(function () {
                  this.oRoute.navTo("RouteMain",{
                            id : userCur
                          });
              }.bind(this), 2000);
            }
          }.bind(this),
      });
    },

    onCancelar: function(e){
      var textLiberacao = "";
      var dialog = new sap.m.Dialog({
        title: "Cancelar",
        type: 'Message',
        content: [
          new sap.m.Label({ text: 'Deseja Cancelar a solicita????o selecionadas?', labelFor: 'approveDialogTextarea'}),
          new sap.m.TextArea('approveDialogTextarea', {
            width: '100%',
            placeholder: "Cancelar",
            value : textLiberacao
          })
        ],

        beginButton: new sap.m.Button({
          text: "Cancelar",
          press: function () {
            var sText  = sap.ui.getCore().byId('approveDialogTextarea').getValue();
            if (sText.length < 10){
              sap.m.MessageToast.show(`Obrigat??rio inserir justifica com m??nimo de 10 caracteres`);
            }
            else{
              this.processarCancelamento(sText, dialog);
            }
          }.bind(this)
        }),

        endButton: new sap.m.Button({
          text: 'Fechar',
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.open();
    },

        onAddNewLine: function () {
      var Zpdnum = 1; var curArr = [];
      var dataDoc = "", bukrs = "";
            if (this.getView().getModel("RemanejModel") != undefined) {
                curArr = this.getView().getModel("RemanejModel").getData().RemanejSet;
                Zpdnum = curArr.length + 1;
        if(curArr.length > 0){
            bukrs = curArr[0].Bukrs
            dataDoc = curArr[0].Bldat
                }
            }

            var newItem =
            {
                "Buzei": Zpdnum,
        "Bukrs": bukrs,
                "Bldat": dataDoc,
        "ScreenEnabled" : true
                //"Pargb": "0003",
                //"Bukrs": "",
                //"Cpudt": "",
                //"Mojah": "",
                /*"Bldat": "",
                "Kodeb": "",
                "Ksdeb": "",
                "Kscre": "",
                "Kocre": "",
                "Kssup": "",
                "Kosup": "",
                "Sgtxt": "",*/
                //"Wrbtr": 0

            }
            curArr.push(newItem);
            this.RemanejModel = new sap.ui.model.json.JSONModel({
                RemanejSet: curArr
            });
            this.RemanejModel.setDefaultBindingMode("TwoWay");
            this.RemanejModel.updateBindings();
            this.getView().setModel(this.RemanejModel, "RemanejModel");
            sap.ui.getCore().setModel(this.RemanejModel, "RemanejModel");
        },

    handleCcHelpSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilter = new sap.ui.model.Filter("Txt50",  sap.ui.model.FilterOperator.Contains, sValue);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter([oFilter]);
    },

        updateSum: function (e) {
            var value = e.mParameters.value.replaceAll(".", "").replace(",", ".");//this.getView().getModel("RemanejModel").getObject(e.oSource.oPropagatedProperties.oBindingContexts.RemanejModel.sPath).Wrbtr.replaceAll(".", "").replace(",", ".");
            value = Intl.NumberFormat("pt-br", {
                style: "currency",
                currency: "BRL"
            }).format(value).replace("R$", "").replace("??", "");
            this.getView().getModel("RemanejModel").getObject(e.oSource.oPropagatedProperties.oBindingContexts.RemanejModel.sPath).Wrbtr = value;
            this.getView().getModel("RemanejModel").updateBindings();

            var newValue = 0;
            var arrItens = this.getView().getModel("RemanejModel").getData().RemanejSet;
            for (var i = 0; i < arrItens.length; i++) {
        arrItens[i].Wrbtr = arrItens[i].Wrbtr + "";
                newValue = newValue + Number(arrItens[i].Wrbtr.replaceAll(".", "").replace(",", "."));
            }
            newValue = Intl.NumberFormat("pt-br", {
                style: "currency",
                currency: "BRL"
            }).format(newValue).replace("R$", "").replace("??", "");
            this.getView().byId("inputTotalOrcamentoReman").setValue(newValue);
        },

        processTable: function () {
            this.onAddNewLine();
        },

        onSearchKostl: function (e) {
      this.currentField = "Kodeb";
            var t = e.getSource().getValue();
            this.inputId = e.getSource().getId();
            this.curLineSpath = e.oSource.mBindingInfos.value.binding.oContext.sPath;
            var a;
            var r;
            var s;
            if (!this.oDialogKostl) {
                this.oDialogKostl = sap.ui.xmlfragment("queroquerons.suplementacao.view.ValueHelpDialogKostl", this)
            }
            if (this.oDialogKostl) {
                //a = "/CentroCustoSet";
                a = "/DivParSet";
                var o = [];
                s = new sap.ui.model.Filter("Hkont", sap.ui.model.FilterOperator.EQ, this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Ksdeb);
                o.push(s);
                /*s = new sap.ui.model.Filter("IKokrs", sap.ui.model.FilterOperator.EQ, "CCQQ");
                o.push(s);*/
                var n = "";
                if (sap.ui.getCore().getModel("oUserModel") != undefined
                    && sap.ui.getCore().getModel("oUserModel").getData().UserSet != undefined) {
                    n = sap.ui.getCore().getModel("oUserModel").getData().UserSet.FILIAL || sap.ui.getCore().getModel("oUserModel").getData().UserSet.MATRIZ || sap.ui.getCore().getModel("oUserModel").getData().UserSet.CD;;
                }
                //var n = "0048";//l.dadosMatricula.results[0].FILIAL || l.dadosMatricula.results[0].MATRIZ || l.dadosMatricula.results[0].CD;
                //s = new sap.ui.model.Filter("IUnidadeEmpresa", sap.ui.model.FilterOperator.EQ, n);
                //o.push(s);
                r = new sap.m.StandardListItem({
                    title: "{Kostl}",
                    description: "{Ltext}"
                });
                this.oDialogKostl.setTitle("Centro de custo");
                this.oDialogKostl.unbindAggregation("items");
                this.oDialogKostl.bindAggregation("items", {
                    path: a,
                    template: r,
                    filters: o
                });
                this.oDialogKostl.open(t)
            }

        },

     onSearchKostl2: function (e) {
       this.currentField = "Kocre";
            var t = e.getSource().getValue();
            this.inputId = e.getSource().getId();
            this.curLineSpath = e.oSource.mBindingInfos.value.binding.oContext.sPath;
            var a;
            var r;
            var s;
            if (!this.oDialogKostlEntrada) {
                this.oDialogKostlEntrada = sap.ui.xmlfragment("queroquerons.suplementacao.view.ValueHelpDialogKostlEntrada", this)
            }
            if (this.oDialogKostlEntrada) {
                a = "/CentroCustoSet";
                var o = [];
                //s = new sap.ui.model.Filter("IBukrs", sap.ui.model.FilterOperator.EQ, "0011");
        s = new sap.ui.model.Filter("IBukrs", sap.ui.model.FilterOperator.EQ, this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Bukrs);
                o.push(s);
                s = new sap.ui.model.Filter("IKokrs", sap.ui.model.FilterOperator.EQ, "CCQQ");
                o.push(s);
                var n = "";
                if (sap.ui.getCore().getModel("oUserModel") != undefined
                    && sap.ui.getCore().getModel("oUserModel").getData().UserSet != undefined) {
                    n = sap.ui.getCore().getModel("oUserModel").getData().UserSet.FILIAL || sap.ui.getCore().getModel("oUserModel").getData().UserSet.MATRIZ || sap.ui.getCore().getModel("oUserModel").getData().UserSet.CD;;
                }
                //var n = "0048";//l.dadosMatricula.results[0].FILIAL || l.dadosMatricula.results[0].MATRIZ || l.dadosMatricula.results[0].CD;
                s = new sap.ui.model.Filter("IUnidadeEmpresa", sap.ui.model.FilterOperator.EQ, n);
                o.push(s);
                r = new sap.m.StandardListItem({
                    title: "{Kostl}",
                    description: "{Ltext}"
                });
                this.oDialogKostlEntrada.setTitle("Centro de custo");
                this.oDialogKostlEntrada.unbindAggregation("items");
                this.oDialogKostlEntrada.bindAggregation("items", {
                    path: a,
                    template: r,
                    filters: o
                });
                this.oDialogKostlEntrada.open(t)
            }

        },

        onCContabMatchCode: function (e) {
      this.currentField = "Ksdeb";
            var t = e.getSource().getValue();
            this.inputId = e.getSource().getId();
            this.curLineSpath = e.oSource.mBindingInfos.value.binding.oContext.sPath;
            var a;
            var r;
            var s;
            if (!this.oDialogCc) {
                this.oDialogCc = sap.ui.xmlfragment("queroquerons.suplementacao.view.ValuesHelpCContab", this)
            }
            if (this.oDialogCc) {

                var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                    useBatch: false
                });

                oServiceModel.setHeaders({
                    "X-Requested-With": "X"
                })
        var aFilters = [];
        var oFilter = new sap.ui.model.Filter("Tipounid",
          sap.ui.model.FilterOperator.EQ,
          sap.ui.getCore().getModel("oUserModel").getData().UserSet.TIPOUNI);
        aFilters.push(oFilter);

                oServiceModel.read("/sh_ccSet", {
                    async: true,
                    filters: aFilters,
                    success: function (oData) {

                        this.oCContabModel = new sap.ui.model.json.JSONModel({
                            oCContabSet: oData.results
                        });
                        this.oCContabModel.setDefaultBindingMode("TwoWay");
                        this.oCContabModel.updateBindings();
                        this.getView().setModel(this.oCContabModel, "oCContabModel");
                        sap.ui.getCore().setModel(this.oCContabModel, "oCContabModel");

                    }.bind(this),
                    error: function (evt) {
                    }
                });
                this.oDialogCc.open(t)
            }
        },

    onCContabMatchCode2: function (e) {
      this.currentField = "Kscre";
            var t = e.getSource().getValue();
            this.inputId = e.getSource().getId();
            this.curLineSpath = e.oSource.mBindingInfos.value.binding.oContext.sPath;
            var a;
            var r;
            var s;
            if (!this.oDialogCc) {
                this.oDialogCc = sap.ui.xmlfragment("queroquerons.suplementacao.view.ValuesHelpCContab", this)
            }
            if (this.oDialogCc) {

                var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                    useBatch: false
                });

                oServiceModel.setHeaders({
                    "X-Requested-With": "X"
                })

        var aFilters = [];
        var oFilter = new sap.ui.model.Filter("Tipounid",
          sap.ui.model.FilterOperator.EQ,
          sap.ui.getCore().getModel("oUserModel").getData().UserSet.TIPOUNI);
        aFilters.push(oFilter);

                oServiceModel.read("/sh_ccSet", {
                    async: true,
                    filters: aFilters,
                    success: function (oData) {

                        this.oCContabModel = new sap.ui.model.json.JSONModel({
                            oCContabSet: oData.results
                        });
                        this.oCContabModel.setDefaultBindingMode("TwoWay");
                        this.oCContabModel.updateBindings();
                        this.getView().setModel(this.oCContabModel, "oCContabModel");
                        sap.ui.getCore().setModel(this.oCContabModel, "oCContabModel");

                    }.bind(this),
                    error: function (evt) {
                    }
                });
                this.oDialogCc.open(t)
            }
        },

        onValueHelpBukrs: function (e) {
            var t = e.getSource().getValue();
            this.inputId = e.getSource().getId();
            this.curLineSpath = e.oSource.mBindingInfos.value.binding.oContext.sPath;
            var a;
            var r;
            var s;
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment("queroquerons.suplementacao.view.ValueHelpDialogBukrs", this)
            }
            if (this.oDialog) {
                a = "/sh_bukrsSet";
                r = new sap.m.StandardListItem({
                    title: "{Bukrs}",
                    description: "{Butxt}"
                });
                //s = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, t);
                this.oDialog.setTitle("Empresa")
                this.oDialog.unbindAggregation("items");
                this.oDialog.bindAggregation("items", {
                    path: a,
                    template: r/*,
                    filters: [s]*/
                });
                this.oDialog.open(t)
            }
        },

        handleCcHelpConfirm: function (e) {
            var t = e.getParameter("selectedItem");
            var a = this.getMetadata().getName();
            var r = this
            if (t) {
                var linha = this.getView().getModel("oCContabModel").getObject(t.oBindingContexts.oCContabModel.sPath)
                var n = r.getView().getModel();
        if (this.currentField =="Ksdeb"){
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).KsdebTxt = linha.Txt50;
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Ksdeb = linha.Saknr;
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Kagru = linha.Kagru;
          this.getView().getModel("RemanejModel").updateBindings()
        }
        else{
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).KscreTxt = linha.Txt50;
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Kscre = linha.Saknr;
          this.getView().getModel("RemanejModel").updateBindings()
        }
            }
        },

        handleTableValueHelpConfirmKostl: function (e) {
            var t = e.getParameter("selectedItem");
            var a = this.getMetadata().getName();
            var r = this
            if (t) {
                var l = t.getBindingContext().getObject().Kostl;
                var n = r.getView().getModel();
                //this.byId(this.inputId).setValue(t.getBindingContext().getObject().Bukrs);
        if (this.currentField == "Kocre"){
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Kocre = l;
        }
        else{
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Kodeb = l;
        }
                this.getView().getModel("RemanejModel").updateBindings()

        //buscar pargb
        var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                    useBatch: false
                });
                oServiceModel.setHeaders({
                    "X-Requested-With": "X"
                });
        var aFilters = [];
        var oFilter = new sap.ui.model.Filter("Hkont",
          sap.ui.model.FilterOperator.EQ,
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Ksdeb+"");
        aFilters.push(oFilter);
        oFilter = new sap.ui.model.Filter("Kostl",
          sap.ui.model.FilterOperator.EQ,
          l);
        aFilters.push(oFilter);
                oServiceModel.read("/DivParSet", {
                    async: true,
                    filters: aFilters,
                    success: function (oData) {
                        console.log(oData.results);
            if(oData.results.length > 0){
              this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Pargb = oData.results[0].Pargb;
              this.getView().getModel("RemanejModel").updateBindings();
            }
            else{
              sap.m.MessageToast.show(`N??o foi poss??vel determinar a divis??o de parceiro`);
              this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Pargb = "";
            }
                    }.bind(this),
                    error: function (evt) {
                    }
                });
            }
        },

    handleTableValueHelpConfirmKostlEntrada: function (e) {
            var t = e.getParameter("selectedItem");
            var a = this.getMetadata().getName();
            var r = this
            if (t) {
                var l = t.getBindingContext().getObject().Kostl;
                var n = r.getView().getModel();
                //this.byId(this.inputId).setValue(t.getBindingContext().getObject().Bukrs);
        if (this.currentField == "Kocre"){
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Kocre = l;
        }
        else{
          this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Kodeb = l;
        }
                this.getView().getModel("RemanejModel").updateBindings()
            }
        },

        handleTableValueHelpConfirm: function (e) {
            var t = e.getParameter("selectedItem");
            var a = this.getMetadata().getName();
            var r = this
            if (t) {
                var l = t.getBindingContext().getObject().Bukrs;
                var n = r.getView().getModel();
                //this.byId(this.inputId).setValue(t.getBindingContext().getObject().Bukrs);
                this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Bukrs = l;
                this.getView().getModel("RemanejModel").updateBindings()
            }
        },

        handleTableValueHelpSearch: function (oEvent) {
            var value = oEvent.getParameter("value");
      var sTerm = "Bukrs"
      var Stext = "Butxt"
      var path = "/sh_bukrsSet";

      var oTableStdListTemplate = new sap.m.StandardListItem({
        title: "{" + sTerm + "}",
        description: "{" + Stext + "}"
      });// //create a filter for the binding

      var oFilterTableNo = new sap.ui.model.Filter(sTerm,
        sap.ui.model.FilterOperator.EQ,
        value);

      var oFilterTableNo2 = new sap.ui.model.Filter(Stext,
        sap.ui.model.FilterOperator.EQ
        ,
        value);

      this.oDialog.unbindAggregation("items");
      this.oDialog.bindAggregation("items", {
        path: path,
        template: oTableStdListTemplate,
        filters: [oFilterTableNo, oFilterTableNo2]
      })
        },

    handleTableValueHelpSearchKostl: function (oEvent) {
      var n = oEvent.getParameter("value");
            var d = "/CentroCustoSet";
      var m = [];
      var g = new sap.m.StandardListItem({
        title: "{Kostl}",
        description: "{Ltext}"
      });
      var p = new sap.ui.model.Filter("IBukrs", sap.ui.model.FilterOperator.EQ,  this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Bukrs);
      m.push(p);
      p = new sap.ui.model.Filter("IKokrs", sap.ui.model.FilterOperator.EQ, "CCQQ");
      m.push(p);
      var f = sap.ui.getCore().getModel("oUserModel").getData().UserSet.FILIAL || l.dadosMatricula.results[0].MATRIZ || sap.ui.getCore().getModel("oUserModel").getData().UserSet.CD;
      p = new sap.ui.model.Filter("IUnidadeEmpresa", sap.ui.model.FilterOperator.EQ, f);
      m.push(p);
      if (n) {
        var p = new sap.ui.model.Filter("IDescricao", sap.ui.model.FilterOperator.EQ, n);
        m.push(p)
      }
      this.oDialogKostl.unbindAggregation("items");
      this.oDialogKostl.bindAggregation("items", {
        path: d,
        template: g,
        filters: m
      })
        },

    handleTableValueHelpSearchKostlEntrada: function (oEvent) {
      var n = oEvent.getParameter("value");
            var d = "/CentroCustoSet";
      var m = [];
      var g = new sap.m.StandardListItem({
        title: "{Kostl}",
        description: "{Ltext}"
      });
      var p = new sap.ui.model.Filter("IBukrs", sap.ui.model.FilterOperator.EQ,  this.getView().getModel("RemanejModel").getObject(this.curLineSpath).Bukrs);
      m.push(p);
      p = new sap.ui.model.Filter("IKokrs", sap.ui.model.FilterOperator.EQ, "CCQQ");
      m.push(p);
      var f = sap.ui.getCore().getModel("oUserModel").getData().UserSet.FILIAL || l.dadosMatricula.results[0].MATRIZ || sap.ui.getCore().getModel("oUserModel").getData().UserSet.CD;
      p = new sap.ui.model.Filter("IUnidadeEmpresa", sap.ui.model.FilterOperator.EQ, f);
      m.push(p);
      if (n) {
        var p = new sap.ui.model.Filter("IDescricao", sap.ui.model.FilterOperator.EQ, n);
        m.push(p)
      }
      this.oDialogKostlEntrada.unbindAggregation("items");
      this.oDialogKostlEntrada.bindAggregation("items", {
        path: d,
        template: g,
        filters: m
      })
        },

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this)
        },
        onSalvar: function (e) {
      var userCur = sap.ui.getCore().getModel("oUserModel").getData().UserSet.USER;
      userCur = "" || userCur.replace( /^\D+/g, '');
      if(userCur == null || userCur == undefined){
        userCur = this.IdUser
      }
      userCur = "" || userCur.replaceAll("/", "");
            var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                useBatch: false
            });

            oServiceModel.setHeaders({
                "X-Requested-With": "X"
            });

            var oHeader = {};
            oHeader.OrcamentoItem = [];
            oHeader.Zcorc = "02";
            if (sap.ui.getCore().getModel("oUserModel") != undefined
                && sap.ui.getCore().getModel("oUserModel").getData().UserSet != undefined) {
                oHeader.Ernam = userCur;
            }
            else {
                oHeader.Ernam = "";
            }
      if (this.Action == "2"){
         oHeader.Zpdsol = sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet.Zpdsol;
      }
      oHeader.Action = this.Action;
            oHeader.Bukrs = "";
            oHeader.Mensagem = "";
            oHeader.Belnr = "";
            oHeader.Gjahr = "";
            oHeader.Buzei = "";
            oHeader.Wrbtr = this.getView().byId("inputTotalOrcamentoReman").getValue();
            oHeader.Wrbtr = oHeader.Wrbtr.replaceAll(".", "").replace(",", ".");
            var dataValid = true;
            oHeader.OrcamentoItem = this.getView().getModel("RemanejModel").getData().RemanejSet;
            for (var i = 0; i < oHeader.OrcamentoItem.length; i++) {
                if (
                    oHeader.OrcamentoItem[i].Bldat == "" ||
                    //oHeader.OrcamentoItem[i].Mojah == "" ||
                    oHeader.OrcamentoItem[i].Sgtxt == "" ||
                    oHeader.OrcamentoItem[i].Bukrs == "" ||
                    oHeader.OrcamentoItem[i].Wrbtr == "" ||
                    //oHeader.OrcamentoItem[i].Kosup == "" ||
                    oHeader.OrcamentoItem[i].Pargb == "" ||
                    //oHeader.OrcamentoItem[i].Kssup == "" ||
                    oHeader.OrcamentoItem[i].Wrbtr == 0 ||
                    oHeader.OrcamentoItem[i].Bldat == undefined ||
                    //oHeader.OrcamentoItem[i].Mojah == undefined ||
                    oHeader.OrcamentoItem[i].Bukrs == undefined ||
                    oHeader.OrcamentoItem[i].Wrbtr == undefined ||
                    oHeader.OrcamentoItem[i].Sgtxt == undefined ||
                    //oHeader.OrcamentoItem[i].Kosup == undefined ||
                    oHeader.OrcamentoItem[i].Pargb == undefined
                    //oHeader.OrcamentoItem[i].Kssup == undefined
                ) {
                    dataValid = false;
                    break;
                }
                if (oHeader.OrcamentoItem[i].Bldat.includes(".")) {
            var bldat = oHeader.OrcamentoItem[i].Bldat.split(".");
            oHeader.OrcamentoItem[i].Bldat = bldat[2] + bldat[1] + bldat[0];
            //var mojah = oHeader.OrcamentoItem[i].Mojah.split(".");
            oHeader.OrcamentoItem[i].Mojah = bldat[2] + bldat[1];
          }
          else{
            if(oHeader.OrcamentoItem[i].Mojah == ""){
              var bldat = oHeader.OrcamentoItem[i].Bldat;
              oHeader.OrcamentoItem[i].Mojah = bldat.substring(0,4) +  bldat.substring(6,4);
            }
          }
                oHeader.OrcamentoItem[i].Buzei = oHeader.OrcamentoItem[i].Buzei + "";
                oHeader.OrcamentoItem[i].Buzei = oHeader.OrcamentoItem[i].Buzei.padStart(3, '0');
                oHeader.OrcamentoItem[i].Cpudt = oHeader.OrcamentoItem[i].Bldat;
                oHeader.OrcamentoItem[i].Wrbtr = oHeader.OrcamentoItem[i].Wrbtr.replaceAll(".", "").replace(",", ".");
        if (oHeader.Bukrs == "") {
          oHeader.Bukrs = oHeader.OrcamentoItem[i].Bukrs;
          oHeader.Erdat = oHeader.OrcamentoItem[i].Bldat;
        }
        if (this.Action == "2"){
          oHeader.OrcamentoItem[i].Belnr = sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet.Belnr;
          oHeader.OrcamentoItem[i].Gjahr =  sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet.Gjahr;
          oHeader.OrcamentoItem[i].Zcorc = sap.ui.getCore().getModel("oScreenModel").getData().ScreenSet.Zcorc;
        }
                delete oHeader.OrcamentoItem[i].KscreTxt;
        delete oHeader.OrcamentoItem[i].KsdebTxt;
        delete oHeader.OrcamentoItem[i].ScreenEnabled;

            }
            if (dataValid == true) {
                oServiceModel.create("/OrcamentoHeaderSet", oHeader, {
                    success: function (oData, oResponse) {
                        console.log(oData)
                        if (oData.Mensagem != undefined && oData.Mensagem != '') {
                            sap.m.MessageToast.show(oData.Mensagem)
                        }
            else if (this.Action == "1" && oData.Mensagem == "" && oData.Belnr == "") {
              sap.m.MessageToast.show('Erro na inser????o de dados. Verifique as contas selecionadas')
            }
                        else {
                            sap.m.MessageToast.show(`Opera????o efetuada com sucesso`);
                            setTimeout(function () {
                                this.oRoute.navTo("RouteMain",{
                            id : userCur
                          });

                            }.bind(this), 2000);
                        }
                    }.bind(this),
                    error: function (error, oData) {
                        sap.m.MessageToast.show(`Erro na opera????o`);
                    }
                });
            }
            else {
                sap.m.MessageToast.show(`Existem linham com campos n??o preenchidos. Verifique e tente novamente`);
            }
        },
        onVoltar: function (e) {
            //this.oRoute.navTo("RouteMain")
      var userCur = sap.ui.getCore().getModel("oUserModel").getData().UserSet.USER;
      userCur = "" || userCur.replace( /^\D+/g, '');
      if(userCur == null || userCur == undefined){
        userCur = this.IdUser
      }
      userCur = "" || userCur.replaceAll("/", "");
      this.oRoute.navTo("RouteMain",{
                    id : userCur
                  });
        }

    })
});