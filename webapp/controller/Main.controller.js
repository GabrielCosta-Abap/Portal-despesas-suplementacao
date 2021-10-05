sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Label",
	"sap/m/Select",
	"sap/m/SelectDialog",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	'sap/ui/model/Sorter',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/core/util/Export',], 
	function (e, t, o, i, a, n, s, r, u, l, p, c, m, d, g, h, R, f, Sorter, ExportTypeCSV,Export) {
    "use strict";
    //var _oResponsivePopover;
    return e.extend("queroquerons.suplementacao.controller.Main", {

// FS - GC - 08/09/2021 - Início
		divisao: 0,
// FS - GC - 08/09/2021 - fim

        oRoute: function () {
            //this.getOrcamento();
        },
        onInit: function () {
            this.oRoute = this.getOwnerComponent().getRouter();

            var e = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                useBatch: false
            });
            this.getView().setModel(e);
            sap.ui.getCore().setModel(e);
            this.globalView = this.getView();

			// FS - GC - 08/09/2021 - Início
			var route = this.getRouter().getRoute('RouteMain')
			route.attachPatternMatched(this.onPatternMatched, this)
        	// FS - GC - 08/09/2021 - Fim
		
			var url_string = window.location.href.replace("user=#", "user=");
            var url = new URL(url_string);
            var userCur = url.searchParams.get("user");
            if (userCur != "") {
                var t = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, userCur);
                var a = this.getView().getModel();
                var r = "/sh_pernrSet";
                a.read(r, {
                    filters: [t],
                    success: function (e, t) {
                        var user = {}
						if(e.results[0].FILIAL != undefined && e.results[0].FILIAL!= ""){
							e.results[0].TIPOUNI = 'F';                        	
						}
						else{
							e.results[0].TIPOUNI = 'M';
						}
						userCur = "" || userCur.replaceAll("/", "");			
						e.results[0].USER = userCur;
                        console.log(e);
                        this.oUserModel = new sap.ui.model.json.JSONModel({
                            UserSet: e.results[0]
                        });
                        this.oUserModel.setDefaultBindingMode("TwoWay");
                        this.oUserModel.updateBindings();
                        this.getView().setModel(this.oUserModel, "oUserModel");
                        sap.ui.getCore().setModel(this.oUserModel, "oUserModel");

						this.divisao = e.results[0].FILIAL || e.results[0].MATRIZ || e.results[0].CD

                    }.bind(this),
                    error: function (e) {
                        debugger
                    }.bind(this)
                });
            }
            /*if (this.getView().getModel("SuplemenModel") != undefined) {
                this.getView().getModel("SuplemenModel").getData().SuplemenSet = [];
                this.getView().getModel("SuplemenModel").updateBindings();
            }*/
        },

		onPatternMatched: function(oEvent){
			this.getOrcamento();
		},

        onAscending: function (e) {
            var oTable = this.getView().byId("idTableOrcamento");
            var oItems = oTable.getBinding("items");
            var oBindingPath = sap.ui.getCore().getModel("OrcamentoModel").getData().OrcamentoSet.bindingValue;
            //oBindingPath = "hdatumint";
            var oSorter = new Sorter(oBindingPath);
            oItems.sort(oSorter);
            this.oResponsivePopover.close();
        },

        onDescending: function (e) {
            var oTable = this.getView().byId("idTableOrcamento");
            var oItems = oTable.getBinding("items");
            //var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
            var oBindingPath = sap.ui.getCore().getModel("OrcamentoModel").getData().OrcamentoSet.bindingValue;
            //oBindingPath = "hdatumint";
            var oSorter = new Sorter(oBindingPath, true);
            oItems.sort(oSorter);
            this.oResponsivePopover.close();
        },

        onOpen: function (oEvent) {
            //On Popover open focus on Input control
            var oPopover = sap.ui.getCore().byId(oEvent.getParameter("id"));
            var oPopoverContent = oPopover.getContent()[0];
            //var oCustomListItem = oPopoverContent.getItems()[2];
            //var oCustomContent = oCustomListItem.getContent()[0];
            /*var oInput = oCustomContent.getItems()[1];
            oInput.focus();
            oInput.$().find('.sapMInputBaseInner')[0].select();*/
        },

        onClick: function (oID) {
            var that = this;
            $('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
                var oTarget = oEvent.currentTarget; //Get hold of Header Element
                var oLabelText = oTarget.childNodes[0].textContent; //Get Column Header text
                var oIndex = oTarget.id.slice(-2).replace("o", ""); //Get the column Index
                var oView = that.getView();
                //var oTable = oView.byId("idProductsTable");
                //var oModel = oTable.getModel().getProperty("/ProductCollection"); //Get Hold of Table Model Values
                var oModel = sap.ui.getCore().getModel("OrcamentoModel").getData().OrcamentoSet; //Get Hold of Table Model Values
                var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
                oModel.bindingValue = oKeys[oIndex];
                that.oResponsivePopover.openBy(oTarget);
            });
        },

        formatMesAno: function (e) {
            if (e != null) {
                var t = e.substring(0, 4);
                var o = e.substring(4, 6);
                var a = o + "/" + t;
                return a
            }
        },

        handleTableValueHelpConfirm: function (e) {
            var t = e.getParameter("selectedItem");
            var a = this.getMetadata().getName();
            var r = this
            if (t) {
                var l = t.getBindingContext().getObject().Bukrs;
                this.byId("inputOrcamentoBukrs").setValue(t.getBindingContext().getObject().Bukrs);
            }
        },

        onValueHelpBukrs: function (e) {
            var t = e.getSource().getValue();
            this.inputId = e.getSource().getId();
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

        onVoltar: function (o) {
            var userCur = sap.ui.getCore().getModel("oUserModel").getData().UserSet.USER;
			userCur = "" || userCur.replaceAll("/", "");			
            var n = window.location.protocol + "//" + window.location.host + "/sap/bc/bsp/sap/zportal_home/index.html" + "#" + userCur;
            window.location.replace(n)
        },

        setButtonColor: function (e) {
            if (e != null && e != undefined) {
                if (e.includes("P")) {
                    return "Default"
                } else if (e.includes("A") || e.includes("2")) {
                    return "Accept"
                    //} else if (e.includes("R")) {
                } else if (e.includes("4") || e.includes("3")) {
                    return "Reject"
                }
            }
        },

        formatName1: function (Name1) {
            if (Name1) {
                var primeiroNome = Name1.split(' ')[0]
                var ultimoNome = Name1.split(' ')[Name1.split(' ').length - 1]

                primeiroNome = primeiroNome[0].toUpperCase() + primeiroNome.substring(1).toLowerCase()
                ultimoNome = ultimoNome[0].toUpperCase() + ultimoNome.substring(1).toLowerCase()

                var nomeFormatado = primeiroNome + ' ' + ultimoNome
                return nomeFormatado
            }
        },

        handleEmailPress: function (e) {
            this.byId("myPopover").close()
        },

        handlePopoverPress: function (e) {
            var t = e.getSource(),
                o = this.getView();
            var r = e.getSource().getParent().getCells()[8].getText();
            if (r != "Cancelado" && r != "Rejeitado") {
                return
            }
            var textRej = this.getView().getModel("OrcamentoModel").getObject(e.oSource.oPropagatedProperties.oBindingContexts.OrcamentoModel.sPath).MotRej;
            var a = e.getSource().getParent().getCells()[0].getText().replace("/", "%2F");
            if (!this._pPopover) {
                this._pPopover = f.load({
                    id: o.getId(),
                    name: "queroquerons.suplementacao.view.Popover",
                    controller: this
                }).then(function (e) {
                    o.addDependent(e);
                    e.unbindElement();
                    this.getView().byId("textoJustificativa").setText(textRej);
                    //e.bindElement("/DespesaFornecedorHeaderSet(Zpdsol='" + a + "')");
                    return e
                }.bind(this))
            }
            this._pPopover.then(function (e) {
                e.unbindElement();
                //e.bindElement("/DespesaFornecedorHeaderSet(Zpdsol='" + a + "')");
                e.openBy(t)
                this.getView().byId("textoJustificativa").setText(textRej);
            }.bind(this))

        },

        formatDate: function (e) {
            if (e != null) {
                var t = e.substring(6, 8);
                var o = e.substring(4, 6);
                var r = e.substring(0, 4);
                var a = t + "/" + o + "/" + r;
                return a
            }
        },


        onMatriculaMatchCode: function (e) {
            this.selItem = e.getSource().getParent();
            this.inputId = e.getSource().getId();
            var t = "queroquerons.suplementacao.view.ValuesHelpDialogMatricula";
            var a;
            var r;
            var s;
            var l = e.getSource();
            var i = this.getView();
            if (!this._kDialog) {
                this._kDialog = f.load({
                    id: i.getId(),
                    name: t,
                    controller: this
                }).then(function (e) {
                    i.addDependent(e);
                    return e
                })
            }
            this._kDialog.then(function (e) {
                var t = !!l.data("growing");
                e.setGrowing(t);
                e.setTitle("Matrícula");
                e.open()
            })
        },

        onDataExport: function (e) {
            var oExport = new Export({
                exportType: new ExportTypeCSV({
                    separatorChar: "\t",
                    mimeType: "application/vnd.ms-excel",
                    charset: "utf-8",
                    fileExtension: "xls"
                }),
				//sap.ui.getCore().getModel("OrcamentoModel").getData().OrcamentoSet
                models: sap.ui.getCore().getModel("OrcamentoModel"),
                rows: {
                    path: "/OrcamentoSet"
                },
                columns: [
                    {
                        name: "Solicitacao",
                        template: {
                            content: "{Zpdsol}"
                        }

                    },
					{
                        name: "Data",
                        template: {
                            //content: "{Cpudt}"
							content : {
								parts : [ "Cpudt" ],
								formatter : function(oValue) {
									//console.log(oValue)
									if (oValue == null)
										return "" ;
									return oValue.substr(6,2)+"/"+oValue.substr(4,2)+"/"+oValue.substr(0,4) ;
								}							
							}
                        }
                    },
					{
                        name: "Tipo",
                        template: {
                            //content: "{Dcorc}"
							content : {
								parts : [ "Dcorc" ],
								formatter : function(oValue) {
									//console.log(oValue)
									if (oValue == null)
										return "" ;
									return oValue.replace(/[^a-zA-Z ]/g, "")
								}							
							}
                        }
                    },
					{
                        name: "Empresa",
                        template: {
                            content: "{Bukrs}"
                        }
                    },
					{
                        name: "Cod Aprov",
                        template: {
                            content: "{Pargb}"
                        }
                    },
					{
                        name: "Mes/Ano",
                        template: {
                            //content: "{Mojah}"
							content : {
								parts : [ "Cpudt" ],
								formatter : function(oValue) {
									//console.log(oValue)
									if (oValue == null)
										return "" ;
									return oValue.substr(4,2)+"/"+oValue.substr(0,4) ;
								}							
							}
                        }
                    },
					{
                        name: "Solicitante",
                        template: {
                            content: "{Sname}"
                        }
                    },
					{
                        name: "Valor Total",
                        template: {
                            //content: "{Wrbtr}"
							content : {
								parts : [ "Wrbtr" ],
								formatter : function(oValue) {
									//console.log(oValue)
									if (oValue == null)
										return "" ;
									return Intl.NumberFormat("pt-br", {
												style: "currency",
												currency: "BRL"
											}).format(oValue).replace("R$", "").replace(" ", "");
								}							
							}
							
                        }
                    },
					{
                        name: "Status",
                        template: {
                            content: "{Dstats}"
                        }
                    },
					{
                        name: "Aprovador",
                        template: {
                            content: "{Cname}"
                        }
                    }
                ]
            });
            //* download exported file
			var fileName = "Orcamento" + new Date().toLocaleString().replaceAll("/", "").replaceAll(":", "").replaceAll(" ", "")
            oExport.saveFile(fileName).always(function () {
                this.destroy();
            });			
		},

        onMatriculaAprovMatchCode: function (e) {
            this.selItem = e.getSource().getParent();
            this.inputId = e.getSource().getId();
            var t = "queroquerons.suplementacao.view.ValuesHelpDialogAprov";
            var a;
            var r;
            var s;
            var l = e.getSource();
            var i = this.getView();
            if (!this._kDialogAprov) {
                this._kDialogAprov = f.load({
                    id: i.getId(),
                    name: t,
                    controller: this
                }).then(function (e) {
                    i.addDependent(e);
                    return e
                })
            }
            this._kDialogAprov.then(function (e) {
                var t = !!l.data("growing");
                e.setGrowing(t);
                e.setTitle("Matrícula");
                e.open()
            })
        },

        handleTableValueHelpConfirmMat: function (e) {
            var t = e.getParameter("selectedItem");
            this.byId("inputOrcamentoSolic").setValue(t.getBindingContext().getObject().Pernr);
        },

        handleTableValueHelpConfirmAprov: function (e) {
            var t = e.getParameter("selectedItem");
            this.byId("inputOrcamentoAprov").setValue(t.getBindingContext().getObject().Pernr);
        },

        liveChangeMatricula: function (e) {
            var t = e.getParameters();
            var a = t.value;
            var r = e.getParameter("itemsBinding");
            var s = e.getParameter("value");
            var l = "Cname";
            var i = [];
            if (s) {
                var n = new sap.ui.model.Filter(l, sap.ui.model.FilterOperator.EQ, s);
                i.push(n)
            }
            r.filter(i)
        },
		
		onReset: function () {
			this.getView().byId("inputOrcamentoBukrs").setValue("");
			this.getView().byId("inputOrcamentoNumSol").setValue("");
            this.getView().byId("idDtOrcs").setDateValue(null);
            this.getView().byId("idStatusInput").setSelectedKey("");
			this.getView().byId("inputOrcamentoCodAprov").setValue("");
            this.getView().byId("inputOrcamentoSolic").setValue("");
			this.getView().byId("inputOrcamentoAprov").setValue("");
		},

        getOrcamento: function () {

            if (!this.oResponsivePopover) {
                this.oResponsivePopover = sap.ui.xmlfragment("queroquerons.suplementacao.view.PopoverOrder", this);
                //this._oResponsivePopover.setModel(this.vendasDevolucoesModel, "VendasDevolucoes");
                var that = this;
                var oTable = this.getView().byId("idTableOrcamento");
                oTable.addEventDelegate({
                    onAfterRendering: function () {
                        var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
                        for (var i = 0; i < oHeader.length; i++) {
                            var oID = oHeader[i].id;
                            that.onClick(oID);
                        }
                    }
                }, oTable);
            }
            /*var url_string = window.location.href.replace("user=#", "user=");
            var url = new URL(url_string);
            var userCur = url.searchParams.get("user");*/

            var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
                useBatch: false
            });
            oServiceModel.setHeaders({
                "X-Requested-With": "X"
            })
            var aFilters = [];
            var aFilter;
            var oEmpresa = this.getView().byId("inputOrcamentoBukrs").getValue();
            aFilter = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, oEmpresa);
            aFilters.push(aFilter);
            var oNumSol = this.getView().byId("inputOrcamentoNumSol").getValue();
            aFilter = new sap.ui.model.Filter("Zpdsol", sap.ui.model.FilterOperator.EQ, oNumSol);
            aFilters.push(aFilter);
            if (this.getView().byId("idDtOrcs").getFrom() != undefined && this.getView().byId("idDtOrcs").getFrom() != null) {
                var oDataIni = this.getView().byId("idDtOrcs").getFrom().toLocaleDateString().split("/");;
                oDataIni = oDataIni[2] + oDataIni[1] + oDataIni[0];
                aFilter = new sap.ui.model.Filter("Zdata", sap.ui.model.FilterOperator.EQ, oDataIni);
                aFilters.push(aFilter);
            }
            if (this.getView().byId("idDtOrcs").getTo() != undefined && this.getView().byId("idDtOrcs").getTo() != null) {
                var oDataFim = this.getView().byId("idDtOrcs").getTo().toLocaleDateString().split("/");
                oDataFim = oDataFim[2] + oDataFim[1] + oDataFim[0];
                aFilter = new sap.ui.model.Filter("Cpudt", sap.ui.model.FilterOperator.EQ, oDataFim);
                aFilters.push(aFilter);
            }

			if(this.getView().byId("idStatusInput").getSelectedItem() == null){
				var oStatus = ""
			}else{
				var oStatus = this.getView().byId("idStatusInput").getSelectedItem().getKey();
			}
            
            aFilter = new sap.ui.model.Filter("Zstats", sap.ui.model.FilterOperator.EQ, oStatus);
            aFilters.push(aFilter);
            var oCodAprov = this.getView().byId("inputOrcamentoCodAprov").getValue();
            aFilter = new sap.ui.model.Filter("Pargb", sap.ui.model.FilterOperator.EQ, oCodAprov);
            aFilters.push(aFilter);
            var oSolic = this.getView().byId("inputOrcamentoSolic").getValue();
            aFilter = new sap.ui.model.Filter("Sname", sap.ui.model.FilterOperator.EQ, oSolic);
            aFilters.push(aFilter);
            var oAprov = this.getView().byId("inputOrcamentoAprov").getValue();
            aFilter = new sap.ui.model.Filter("Cname", sap.ui.model.FilterOperator.EQ, oAprov);
            aFilters.push(aFilter);


            oServiceModel.read("/OrcamentoSet", {
                async: true,
                filters: aFilters,
                success: function (oData) {
                    var arrItens = []
                    for (var i = 0; i < oData.results.length; i++) {
                        //delete oData.results[i].Mandt;
                        var itemList = {};
                        itemList.Zstats = oData.results[i].Zstats;
                        itemList.Zpdsol = oData.results[i].Zpdsol;
                        itemList.Cpudt = oData.results[i].Cpudt;
                        itemList.Dcorc = oData.results[i].Dcorc;
                        itemList.Bukrs = oData.results[i].Bukrs;
                        itemList.Pargb = oData.results[i].Pargb;
                        itemList.Mojah = oData.results[i].Mojah;
                        itemList.Sname = oData.results[i].Sname;
                        itemList.Wrbtr = parseFloat(oData.results[i].Wrbtr).toFixed(2);
                        itemList.Dstats = oData.results[i].Dstats;
                        itemList.Cname = oData.results[i].Cname;
						itemList.MotRej = oData.results[i].MotRej;
                        arrItens.push(itemList);
                    }
                    this.OrcamentoModel = new sap.ui.model.json.JSONModel({
                        OrcamentoSet: arrItens
                    });
                    this.OrcamentoModel.setDefaultBindingMode("TwoWay");
                    this.OrcamentoModel.updateBindings();
                    this.getView().setModel(this.OrcamentoModel, "OrcamentoModel");
                    sap.ui.getCore().setModel(this.OrcamentoModel, "OrcamentoModel");

                }.bind(this),
                error: function (evt) {
                }
            });
        },


        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this)
        },
        onNavBack: function (e) {
            window.history.go(-1)
        },
        onItemPress: function (e) {
			var userCur = sap.ui.getCore().getModel("oUserModel").getData().UserSet.USER;
			userCur = "" || userCur.replaceAll("/", "");			
            var item = this.getView().getModel("OrcamentoModel").getObject(e.oSource.oBindingContexts.OrcamentoModel.sPath)
            item.ScreenEnabled = item.Dstats == "Pendente";
            this.oScreenModel = new sap.ui.model.json.JSONModel({
                ScreenSet: item
            });
            this.oScreenModel.setDefaultBindingMode("TwoWay");
            this.oScreenModel.updateBindings();
            this.getView().setModel(this.oScreenModel, "oScreenModel");
            sap.ui.getCore().setModel(this.oScreenModel, "oScreenModel");
            if (item.Dcorc.includes("Supl")) {				
				this.oRoute.navTo("RouteSuplemen",{
					id : userCur
				});
            } else {
                this.oRoute.navTo("RouteRemanej",{
					id : userCur
				});
            }
        },

        formatCurrency: function (e) {
            return Intl.NumberFormat("pt-br", {
                style: "currency",
                currency: "BRL"
            }).format(e).replace("R$", "").replace(" ", "")
        },

        onCriaSolic: function (e) {
            if (!this.oCriaSolicDialog) {
                this.oCriaSolicDialog = new a({
                    title: "Criar nova Solicitação",
                    type: n.Message,
                    content: [new u({
                        text: "Tipo de solicitação:",
                        labelFor: "rejectionNote"
                    }), new l("", {
                        width: "100%",
                        items: [{
                            key: "1",
                            text: "1 - Suplementação"
                        }, {
                            key: "2",
                            text: "2 - Remanejamento"
                        }]
                    })],
                    beginButton: new s({
                        type: r.Emphasized,
                        text: "Avançar",
                        press: function (e) {
							var userCur = sap.ui.getCore().getModel("oUserModel").getData().UserSet.USER;
                            this.oScreenModel = new sap.ui.model.json.JSONModel({
                                ScreenSet: []
                            });
							userCur = "" || userCur.replaceAll("/", "");			
                            this.oScreenModel.setDefaultBindingMode("TwoWay");
                            this.oScreenModel.updateBindings();
                            this.getView().setModel(this.oScreenModel, "oScreenModel");
                            sap.ui.getCore().setModel(this.oScreenModel, "oScreenModel");
                            var t = this.oCriaSolicDialog.getContent()[1].getSelectedItem().getProperty("key");
                            switch (t) {
                                case "1":

								// FS - GC - 08/09/2021 - Início
								// se a divisão for maior que 3, o usuário não tem permissão para solicitar suplementação 
								if(this.divisao < 3){								
									this.oRoute.navTo("RouteSuplemen",{
										id : userCur
									});
								}else{
									c.show('Usuario nao tem permissao para solicitar suplementacao.')
								}
								// FS - GC - 08/09/2021 - Fim

                                    break;
                                case "2":
										this.oRoute.navTo("RouteRemanej",{
											id : userCur
										});

									break
                            }
                            this.oCriaSolicDialog.close()
                        }.bind(this)
                    }),
                    endButton: new s({
                        text: "Voltar",
                        press: function () {
                            this.oCriaSolicDialog.close()
                        }.bind(this)
                    })
                })
            }
            this.oCriaSolicDialog.open()
        }
    })
});