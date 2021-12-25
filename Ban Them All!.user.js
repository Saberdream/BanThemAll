// ==UserScript==
// @name        Ban Them All!
// @namespace   CrazyJeux/Daring-Do
// @author		CrazyJeux/Daring-Do
// @version     7.2
// @description Liste des informations sur tous les signalements que vous avez effectués.
// @match		*://www.jeuxvideo.com/forums/*
// @match		*://*.openuserjs.org/scripts/CrazyJeux/Ban_Them_All!/source
// @icon        https://www.google.com/s2/favicons?domain=jeuxvideo.com
// @resource	jQueryJS    https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.0/jquery.min.js
// @grant       GM_getResourceText
// @grant		unsafeWindow
// @grant		GM_info
// ==/UserScript==tab

//Topic dédié : http://www.jeuxvideo.com/forums/42-1000021-40109033-1-0-1-0-ban-them-all-suivez-l-evolution-de-vos-signalements.htm

	function toCall() {
		function scriptContent() {
			function log() {
				function getRealType(obj) {
					return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1];
				}

				/*
				var args = Array.prototype.slice.call(arguments), str = "", type;
				for (var i = 0; i < args.length; i++) {
					type = getRealType(args[i]);
					str += (i > 0 ? "\n" : "") + "(" + type + ") ";
					type = type.toLowerCase();
					switch (type) {
						case "arguments":
						case "array":
						case "object":
							var cache = [];
							str += JSON.stringify(args[i], function (key, value) {
								if (typeof value === 'object' && value !== null) {
									if (cache.indexOf(value) >= 0) {
										return "(Already shown here)";
									}
									cache.push(value);
								}
								return value;
							}, 4);
							break;
						case "undefined":
							str += "undefined";
							break;
						default:
							str += args[i];
					}
				}
				window.console && window.console.log && window.console.log(str);
                */
			}

			function loadTable() {
				function deleteAllReports() {
					var r = confirm("Êtes-vous sûr de vouloir supprimer tous vos signalements de la liste ?");
					if (!r) {
						return;
					}
					localStorage.setItem("banthemall-reports", "[]");
					var $banthemallwrapper = $("#banthemallwrapper");
					if ($banthemallwrapper.length > 0) {
						$banthemallwrapper.remove();
						return;
					}
					log("all the reports have been deleted");
				}

				function deleteReport() {
					var $tr = $(this).parents("tr:first");
					var reportURL = $tr.find(".message:first").attr("href");
					log("we should delete a single report, its URL is: '" + reportURL + "'");
					$tr.remove();
					var currentReports = localStorage.getItem("banthemall-reports");
					log("currentReports before deleting a single report:", currentReports);
					if (currentReports === null || currentReports === "" || currentReports === "[]") {
						log("there is not a single report to delete...");
						return;
					}
					currentReports = JSON.parse(currentReports);
					var index = null;
					log("reportURL='" + reportURL + "'");
					for (var i = 0; i < currentReports.length; i++) {
						var r = currentReports[i];
						log("report link #" + i + ": '" + r.link + "'");
						if (r.link === reportURL) {
							log("found at index " + i);
							index = i;
							break;
						}
					}
					if (index !== null) {
						currentReports.splice(index, 1);
						log("deleted report");
					}
					log("currentReports after deleting a single report:", currentReports);
					localStorage.setItem("banthemall-reports", JSON.stringify(currentReports));
				}

				var checkHandled = true;

				checkUpdate();

				var $banthemallwrapper = $("#banthemallwrapper");
				if ($banthemallwrapper.length > 0) {
					$banthemallwrapper.remove();
					log("deleted previous wrapper");
					return;
				}

				var currentReports = localStorage.getItem("banthemall-reports");
				log("currentReports to display:", currentReports);
				if (currentReports === null || currentReports === "" || currentReports === "[]") {
					alert("Vous n'avez effectué aucun signalement.");
					return;
				} else {
					currentReports = JSON.parse(currentReports);
				}

				if ($("#banthemallstyle").length === 0) {
					var style = document.createElement("style");
					style.id = "banthemallstyle";
					style.innerHTML = "#banthemalltable th, #banthemalltable td { padding: 5px; }\n\n" +
						"#banthemalltable .nickname, #banthemalltable .message, #banthemalltable .report { font-weight: bold; }\n\n" +
						"#banthemalltable .nickname.notbanned { color: green !important; }\n\n" +
						"#banthemalltable .nickname.banned { color: red !important; }\n\n" +
						"#banthemalltable .nickname.deleted { color: black !important; text-decoration: line-through; }\n\n" +
						"#banthemalltable .message.notdeleted { color: green !important; }\n\n" +
						"#banthemalltable .message.deleted { color: red !important; }\n\n" +
						"#banthemalltable .report.isnotdone { color: red !important; }\n\n" +
						"#banthemalltable .report.isdone { color: green !important; }\n\n" +
						"#banthemalltable .report.error { color: red !important; font-weight: bold; }\n\n";
					document.head.appendChild(style);
					log("added style");
				} else {
					log("the style is already added");
				}

				var divWrapper = document.createElement("div");
				divWrapper.id = "banthemallwrapper";
				divWrapper.style.marginBottom = "20px";
				divWrapper.style.maxHeight = "400px";
				divWrapper.style.overflow = "auto";
				var deleteAllReportsButton = document.createElement("button");
                deleteAllReportsButton.style.color = "black";
				deleteAllReportsButton.innerHTML = "Tout supprimer";
				deleteAllReportsButton.addEventListener("click", deleteAllReports, true);
				divWrapper.appendChild(deleteAllReportsButton);
				var table = document.createElement("table");
				divWrapper.appendChild(table);
				table.id = "banthemalltable";
				table.style.borderCollapse = "separate";
				table.style.borderSpacing = "5px";
				table.innerHTML = "<table>" +
					"<thead>" +
					"<th>Pseudo</th>" +
					"<th>Message signalé</th>" +
					(checkHandled ? "<th>Traité</th>" : "") +
					"<th>Date du message</th>" +
					"<th>Motif</th>" +
					"<th>Commentaire</th>" +
					//"<th>Date du signalement</th>" +
					"<th></th>" +
					"</thead>" +
					"<tbody>" +
					"</tbody>" +
					"</table>";
				var tbody = table.querySelector("tbody");
				var nicknamesArray = [];
				var msgArray = [];
				for (var i = 0; i < currentReports.length; i++) {
					var r = currentReports[i];
					var tr = document.createElement("tr");

					var nick = document.createElement("td");
					var msg = document.createElement("td");
					if (checkHandled) {
						var isHandled = document.createElement("td");
					}
					var msgDate = document.createElement("td");
					var reason = document.createElement("td");
					var comment = document.createElement("td");
					//var reportDate = document.createElement("td");
					var deleteReportWrapper = document.createElement("td");

					var nickLC = r.nickname.toLowerCase();
					if (nickLC === "pseudosupprimé") {
						nick.innerHTML = "<i>Pseudo supprimé</i>";
					} else {
						var nickURL = "http://www.jeuxvideo.com/profil/" + nickLC + "?mode=infos";
						nick.innerHTML = "<a href='" + nickURL + "' target='_blank' class='nickname' data-nickname='" + nickLC + "'>" + r.nickname + "</a>";
						if (nicknamesArray.indexOf(nickLC) < 0) {
							nicknamesArray.push(nickLC);
						}
					}

					if (r.nickname.toLowerCase() === "pseudosupprimé") {
						msg.innerHTML = "<a href='" + r.link + "' target='_blank' class='message'>topic</a>";
					} else {
						msg.innerHTML = "<a href='" + r.link + "' target='_blank' class='message'>message</a>";
						msgArray.push(msg);
					}

					if (checkHandled) {
						isHandled.innerHTML = "...";
					}
					msgDate.innerHTML = r.messagedate;
					reason.innerHTML = r.reason;
					comment.innerHTML = ((typeof r.comment !== "undefined") ? r.comment : "");
					//reportDate.innerHTML = r.reportdate;

					var deleteReportButton = document.createElement("button");
                    deleteReportButton.style.color = "black";
					deleteReportButton.innerHTML = "Supprimer";
					deleteReportButton.addEventListener("click", deleteReport, true);
					deleteReportWrapper.appendChild(deleteReportButton);

					tr.appendChild(nick);
					tr.appendChild(msg);
					if (checkHandled) {
						tr.appendChild(isHandled);
					}
					tr.appendChild(msgDate);
					tr.appendChild(reason);
					tr.appendChild(comment);
					//tr.appendChild(reportDate);
					tr.appendChild(deleteReportWrapper);

					tbody.appendChild(tr);
				}
				
				var position;
				//Forum
				if (document.querySelector(".topic-list") !== null) {
					position = document.querySelector(".bloc-pre-pagi-forum");
					position.parentNode.insertBefore(divWrapper, position.nextSibling);
				} else {
					//Topic
					position = document.querySelector(".bloc-message-forum");
					if (position === null) {
						return;
					}
					position.parentNode.insertBefore(divWrapper, position);
				}

				for (var i = 0; i < nicknamesArray.length; i++) {
					var nick = nicknamesArray[i];
					log("nick #" + i + ": '" + nick + "'");
					(function (nick) {
						var $a = $("#banthemalltable a[data-nickname='" + nick + "']");
						var url = "http://www.jeuxvideo.com/profil/" + nick + "?mode=infos";
						var xmlhttp = new XMLHttpRequest();
						xmlhttp.onreadystatechange = function () {
							if (xmlhttp.readyState === 4) {
								log("xmlhttp.status='" + xmlhttp.status + "'");
								if (xmlhttp.status === 200) {
									log("xmlhttp for nick returned");
									var profileDiv = document.createElement('div');
									profileDiv.innerHTML = xmlhttp.responseText;
									profileDiv.style.display.none;
									var alert = profileDiv.querySelector(".alert");
									if (alert !== null) {
										log("alert exists");
										if (alert.innerHTML.indexOf("Le pseudo est banni") >= 0) {
											log("is banned");
											$a.each(function () {
												this.className += " banned";
												this.setAttribute("title", this.innerHTML + " est banni");
											});
											return;
										}
									}
									log("is NOT banned");
									$a.each(function () {
										this.className += " notbanned";
										this.setAttribute("title", this.innerHTML + " n'est pas banni");
									});
									return;
								}
								if (xmlhttp.status === 404) {
									log("xmlhttp 404");
									log("is deleted");
									$a.each(function () {
										this.className += " deleted";
										this.setAttribute("title", this.innerHTML + " a supprimé son pseudo");
									});
									return;
								}
							}
						};
						xmlhttp.open("GET", url, true);
						xmlhttp.send();
					})(nick);
				}

				for (var i = 0; i < msgArray.length; i++) {
					var msg = msgArray[i];
					var isHandled = null;
					if (checkHandled) {
						isHandled = msg.nextSibling;
					}
					(function (msg, isHandled) {
						var a = msg.querySelector("a");
						var url = a.getAttribute("href");
						log("msg #" + i + ": " + url);
						var xmlhttp = new XMLHttpRequest();
						xmlhttp.onreadystatechange = function () {
							if (xmlhttp.readyState === 4) {
								if (xmlhttp.status === 200) {
									log("xmlhttp for msg returned");
									log("This message (" + url + ") still exists");
									a.className += " notdeleted";
									a.setAttribute("title", "Ce message existe toujours");

									if (checkHandled) {
										log("check handled...");
										var msgDiv = document.createElement('div');
										msgDiv.innerHTML = xmlhttp.responseText;
										var reportButton = msgDiv.querySelector(".picto-msg-exclam");
										if (reportButton === null) {
											log("no report button so return");
											return;
										}
										var link = "http://" + window.location.hostname + reportButton.getAttribute("data-selector");
										log("link='" + link + "'");
										(function (link, isHandled) {
											var xmlhttpHandled = new XMLHttpRequest();
											xmlhttpHandled.onreadystatechange = function () {
												if (xmlhttpHandled.readyState === 4 && xmlhttpHandled.status === 200) {
													log("report for msg returned");
													log("report for msg:\n\n" + xmlhttpHandled.responseText);
													var reportDiv = document.createElement('div');
													reportDiv.innerHTML = xmlhttpHandled.responseText;
													var errorDiv = reportDiv.querySelector(".modal-generic-content");
													if (errorDiv !== null) {
														log("errorDiv.innerHTML=" + errorDiv.innerHTML);
														if (errorDiv.innerHTML.indexOf("Ce contenu a déjà été modéré") >= 0 ||
															errorDiv.innerHTML.indexOf("Cet utilisateur ne peut pas être signalé") >= 0) {
															isHandled.innerHTML = "<span class='report isdone'>Oui</span>";
															log("report is handled");
														} else {
															isHandled.innerHTML = "<span class='report isnotdone'>Non</span>";
															log("report is not handled");
														}
													} else {
														log("error (no modal-generic-content class)...");
														isHandled.innerHTML = "<span class='report error'>(erreur)</span>";
													}
												}
											};
											xmlhttpHandled.open("GET", link, true);
											xmlhttpHandled.send();
										})(link, isHandled);
									}

									return;
								}
								if (xmlhttp.status === 410) {
									log("xmlhttp 410");
									log("This message (" + url + ") is deleted");
									a.className += " deleted";
									a.setAttribute("title", "Ce message a été supprimé");

									if (checkHandled) {
										isHandled.innerHTML = "<span class='report isdone'>Oui</span>";
									}

									return;
								}
							}
						};
						xmlhttp.open("GET", url, true);
						xmlhttp.send();
					})(msg, isHandled);
				}
			}

			function onReportButtonClick(e1, messageLink, messageNickname, messageDate) {
				function lookForGTADiv() {
                    function captchaFound($captcha1)
                    {
                        try
                        {
                            log("captcha inside");
                            var $submit = $captcha1.parents("form:first").find("button:contains('Valider')");
                            log("$submit.length v1: " + $submit.length);
                            if ($submit.length === 0)
                            {
                                $submit = $captcha1.parents("form:first").find("button:contains('Booster')");
                                log("$submit.length v2: " + $submit.length);
                            }
                            if ($submit.length === 0)
                            {
                                log("Erreur : bouton de confirmation non trouvé...");
                                alert("Erreur script Ban Them All! : bouton de confirmation non trouvé...");
                            }
                            else
                            {
                                log("HTML:", $submit[0].outerHTML);
                                $submit.on("click", onSubmit);
                            }
                        } catch (e) {
                            var err = "Erreur captchaFound : " + e;
                            log(err);
                            alert(err);
                        }
                    }
                    
					function onSubmit(e2) {
                        //var captchaToFill = false;
                        var timeout = 1e9;

						function lookForGTAResultDiv() {
							try {
                                /*
                                if (captchaToFill === false) {
                                    var $selectImages = $("#rc-imageselect");
                                    if ($selectImages.length === 0) {
                                        log("no 'select images' (yet?)");
                                    } else {
                                        log("there's a captcha to fill, so the timeout is set to 1 billion");
                                        timeout = 1e9;
                                        captchaToFill = true;
                                    }
                                }
                                */
								var $result = $("#signalement_gta");
								if ($result[0] === $gta[0]) {
									log("same div as before, the new one isn't created yet");
									if (performance.now() - timeout2 >= timeout) {
										log("timed out");
									} else {
										setTimeout(lookForGTAResultDiv, 50);
									}
									return;
								}
								if ($result.length === 0) {
									log("no result yet");
									if (performance.now() - timeout2 >= 3000) {
										log("timed out");
									} else {
										setTimeout(lookForGTAResultDiv, 50);
									}
									return;
								}
								log("result found");
								var $alert = $result.find(".alert");
								var $captcha2 = $result.find(".g-recaptcha:first");
								if ($captcha2.length > 0) {
									log("new form (a captcha is here) because no reason selected or wrong captcha");
									lookForGTADiv();
									return;
								}
								if ($alert.length > 0) {
									var content = $alert.text();
									if (content.indexOf("Votre signalement a été enregistré") < 0) {
										log("report NOT ok...");
										return;
									}
									log("report ok for '" + messageNickname + "' for a message sent at '" + messageDate + "' (" + messageLink + ") for '" + reason + "'!");
									var currentReports = localStorage.getItem("banthemall-reports");
									log("currentReports before:", currentReports);
									if (currentReports === null || currentReports === "") {
										currentReports = [];
									} else {
										currentReports = JSON.parse(currentReports);
									}
									var reportDate = new Date();
									var options = {
										year: 'numeric',
										month: 'long',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit',
										second: '2-digit'
									};
									reportDate = reportDate.toLocaleDateString('fr-FR', options);
									currentReports.unshift({
										"nickname": messageNickname,
										"messagedate": messageDate,
										"reportdate": reportDate,
										"reason": reason,
										"link": messageLink,
										"comment": comment
									});
									log("currentReports after:", currentReports);
									localStorage.setItem("banthemall-reports", JSON.stringify(currentReports));
								}
							} catch (e) {
								var err = "Erreur lookForGTAResultDiv : " + e;
								log(err);
								alert(err);
							}
						}

						console.log("submitted! (0)");
						log("submitted!");

						var reason = "(vide)";
						var isBoost = ($gta.find("form").text().indexOf("Ce contenu a déjà été signalé par un utilisateur") >= 0);
						if (isBoost) {
                            log("is boost");
							reason = $gta.find(".col-md-10:first").text();
						} else {
                            log("is not boost");
							reason = $gta.find("#signalement_motif option:selected").text();
							if (reason === "Sélectionnez un motif") {
								reason = "(vide)";
							}
						}
						log("reason='" + reason + "'");

						var comment = "(boost)";
						var $commentTextarea = $("#signalement_commentaire");
						if ($commentTextarea.length > 0) {
							log("textarea exists, $commentTextarea.val()='" + $commentTextarea.val() + "'");
							comment = $commentTextarea.val();
						} else {
							log("it's boost");
						}
						log("comment='" + comment + "'");

						var timeout2 = performance.now();
						lookForGTAResultDiv();
					}

					try {
                        function lookForRecaptcha() {
                            var $gta = $("#signalement_gta");
                            if ($gta.text().indexOf("Vous avez déjà signalé ce contenu") >= 0)
                            {
                                log("already reported");
                                return;
                            }
                            var $curCaptcha = $gta.find("a[href='https://www.google.com/intl/fr/policies/terms/']");
                            if ($curCaptcha.length !== 0) {
                                log("captcha finally found!");
                                captchaFound($curCaptcha);
                            }
                            else
                            {
                                var p1 = performance.now();
                                if (p1 - p0 > 10000) {
                                    log("captcha timeout...");
                                }
                                else
                                {
                                    setTimeout(lookForRecaptcha, 50);
                                }
                            }
                        }

						var $gta = $("#signalement_gta");
						if ($gta.length === 0) {
							log("no div yet");
							if (performance.now() - timeout1 >= 3000) {
								log("timed out");
							} else {
								setTimeout(lookForGTADiv, 50);
							}
							return;
						}
						log("gta div found");
						//log("gta div html:", $gta.html());
                        var p0 = performance.now();
						var $captcha1 = $gta.find(".g-recaptcha:first");
						if ($captcha1.length === 0) {
							//log("no captcha inside");
                            lookForRecaptcha();
						}
                        else
                        {
                            captchaFound($captcha1);
                        }
					} catch (e) {
						var err = "Erreur lookForGTADiv : " + e;
						log(err);
						alert(err);
					}
				}

				var $previousgta = $("#signalement_gta");
				if ($previousgta.length > 0) {
					$previousgta.remove();
					log("deleted previous gta div");
				}
				var timeout1 = performance.now();
				setTimeout(lookForGTADiv, 50);
			}

			function checkUpdate() {
				var updateSrc = "https://openuserjs.org/scripts/CrazyJeux/Ban_Them_All!/source";
				var updateScript = "https://openuserjs.org/src/scripts/CrazyJeux/Ban_Them_All!.user.js";
				var iframe = document.createElement("iframe");
				iframe.id = "CheckUpdateIframe";
				iframe.style.width = "1px";
				iframe.style.height = "1px";
				document.body.appendChild(iframe);

				window.addEventListener("message", function (evt) {
                    var origin = evt.origin || evt.originalEvent.origin;
					if (origin !== 'https://openuserjs.org') {
						return;
					}
                    if (evt.data.hasOwnProperty("started")) {
                        if (evt.data.started === true) {
                            iframe.contentWindow.postMessage({'getversion': true}, origin);
                        }
                        return;
                    }
					var $updateInfo = $("#updateInfo");
					if ($updateInfo.length > 0) {
						return;
					}
					log("evt.data from openuserjs.org:", evt.data);
					if (evt.data.hasOwnProperty("versionnumber")) {
						var remoteVersionNumber = parseInt(evt.data.versionnumber, 10);
						if (remoteVersionNumber === 0) {
							$("#banthemallbutton").after('<span id="updateInfo" style="color: red; font-weight: bold; margin-left: 15px;">Erreur : la recherche de mises à jour a échoué...</span>');
						} else {
							if (remoteVersionNumber > currentVersionNumber) {
								$("#banthemallbutton").after('<span id="updateInfo" style="color: green; font-weight: bold; margin-left: 15px;">Une mise à jour est disponible ! <a href=' + updateScript + ' target="_blank">Cliquez ici pour la télécharger...</a></span>');
							}
						}
						iframe.remove();
						return;
					}
				}, false);

				iframe.src = updateSrc;
			}

			try {
				log("Ban Them All! begin (inside)");

				if (document.querySelector(".menu-user-forum") !== null) {
					var BanthemallLi = document.createElement("li");
					var BTAName = "Ban Them All!";
					BanthemallLi.innerHTML = '<span class="float-start">'+ BTAName +'</span>';
					
					var ShowBanthemallInput = document.createElement('input');
					ShowBanthemallInput.className = 'input-on-off';
					ShowBanthemallInput.id = 'show-banthemall';
					ShowBanthemallInput.setAttribute('type', 'checkbox');
					$(ShowBanthemallInput).on('change', loadTable);
					BanthemallLi.appendChild(ShowBanthemallInput);
					
					var ShowBanthemallLabel = document.createElement('label');
					ShowBanthemallLabel.className = 'btn-on-off';
					ShowBanthemallLabel.setAttribute('for', 'show-banthemall');
					//ShowBanthemallLabel.addEventListener("CheckboxStateChange", loadTable, true);
					BanthemallLi.appendChild(ShowBanthemallLabel);
					
					var position;
					position = document.querySelector(".menu-user-forum");
					position.insertBefore(BanthemallLi, position.nextSibling);
				}
				var $reportButtons = $(".picto-msg-exclam");
				$reportButtons.each(function (index) {
					log("$reportButtons each #" + index);
					var $p = $(this).parents(".bloc-header:first");
					var $date = $p.find(".bloc-date-msg");
					var messageLink;
					if ($date.find("a").length === 0) {
						messageLink = window.location.href;
					} else {
						messageLink = "http://" + window.location.hostname + $p.find(".bloc-date-msg a").attr("href");
					}
					var messageNickname = $p.find(".bloc-pseudo-msg").text().trim().replace(/(\n|\r|\s)/g, "");
					var messageDate = $date.text().trim().replace(/(\n|\r)/g, "").replace("à ", "");
					var $that = $(this);
					(function (messageLink, messageNickname, messageDate) {
						log("messageNickname='" + messageNickname + ", messageDate='" + messageDate + "', messageLink='" + messageLink + "'");
						$that.on("click", function (e) {
							log("report button is clicked");
							onReportButtonClick(e, messageLink, messageNickname, messageDate);
						});
					})(messageLink, messageNickname, messageDate);
				});
				log("Ban Them All! end (inside)");
			} catch (e) {
				var err = "Erreur fonction intérieure : " + e;
				log(err);
				alert(err);
			}
		}

		function handleCheckUpdate() {
			function handleResponse(evt) {
                var origin = evt.origin || evt.originalEvent.origin;
				if (origin === 'http://www.jeuxvideo.com') {
					if (evt.data.hasOwnProperty("getversion")) {
						var editor = document.querySelector("pre#editor");
						setTimeout(function () {
							var lines = editor.querySelectorAll(".ace_content .ace_comment");
							var versionNumber = 0;
							//console.log("lines.length: " + lines.length);
							for (var i = 0; i < lines.length; i++) {
								var line = lines[i].innerHTML;
								//console.log("#" + i + "/" + lines.length + ": '" + line + "'");
								if (line.indexOf("@version") >= 0) {
									//console.log("has version in it");
									versionNumber = line.match(/\d+/g)[0];
									break;
								}
							}
							//console.log("versionNumber: " + versionNumber);
							//console.log("editor.innerHTML:\n" + editor.innerHTML);
							evt.source.postMessage({"versionnumber": versionNumber}, origin);
						}, 3000);
						return;
					}
				}
			}

			window.addEventListener("message", handleResponse, false);
            
            window.parent.postMessage({started: true}, "*");
		}

		function inIframe() {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		}

		try {
			if (window.location.hostname === "openuserjs.org") {
				if (inIframe()) {
					handleCheckUpdate();
				}
				return;
			}

			if (window.location.hostname === "www.jeuxvideo.com" || window.location.hostname === "www.forumjv.com") {
				//console.log("Ban Them All! begin (outside)");
				var index = window.location.pathname.substring(1).indexOf("/");
				var firstDirectory = window.location.pathname.substring(1, index + 1);
				if (firstDirectory !== "forums") {
					//console.log("not in forums");
					return;
				}
				
				if (typeof unsafeWindow.jQuery === "undefined") {
					var jQueryEl = document.createElement("script");
					jQueryEl.type = "text/javascript";
					var content = GM_getResourceText("jQueryJS");
					jQueryEl.innerHTML = content;
					jQueryEl.setAttribute("data-info", "jQueryJS");
					document.head.appendChild(jQueryEl);
				}

				var script = document.createElement("script");
				script.type = "text/javascript";
				script.onerror = function () {
					alert("Ban Them All! n'a pas pu être chargé...");
				};
				var currentVersionNumber = GM_info.script.version;
				script.innerHTML = "(function(){ " + scriptContent.toString() + " var currentVersionNumber = " + currentVersionNumber + "; scriptContent();})();";
				document.head.appendChild(script);
				//console.log("Ban Them All! end (outside)");
			}
		} catch (e) {
			var err = "Erreur fonction extérieure : " + e;
			console.log(err);
			alert(err);
		}
	}

toCall();

addEventListener('instantclick:newpage', toCall);