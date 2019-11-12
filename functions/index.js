'use strict';
//------------------------------
	
	//const {dialogflow} = require('actions-on-google');
	// Bibliotecas necessárias para a comunicação do Dialogflow com o Firebase e o Firebase's Firestore
	const functions = require('firebase-functions');
	const admin = require('firebase-admin');

	// Biblioteca necessária para o funcionamento do fulfillment
	const { WebhookClient } = require('dialogflow-fulfillment');
	// Classes usadas para realizar Rich Responses (respostas dinâmicas)
	const { Card, Suggestion } = require('dialogflow-fulfillment');
	/*
		Template das rich responses:
		Suggestion: new Suggestion(`Mensagem`)
		Card: new Card({
			title: `titulo`,
			imageUrl: 'link da imagem',
			text: `Mensagem, caso queira fazer a mensagem ir para linha de baixo, utilizeo \n `,
			buttonText: 'mensagem do botão',
			buttonUrl: 'link do botão'
		})
		-- para mais informações sobre os Rich Responses, acesse o link disponibilizado no GitHub
	*/

	process.env.DEBUG = 'dialogflow:debug';
	//Inicializa a comunicação com o database Firestore com credenciais padrões
	admin.initializeApp({ credential: admin.credential.applicationDefault() });
	//Faz a comunicação com o database
	const db = admin.firestore();
//------------------------------

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
	//Inicializa o agent do chatbot para fazer requests e receber as respectivas responses
	const agent = new WebhookClient({request: request, response: response});

	/*
		agent.add() - comando para escrever uma mensagem no chat
		function nameFunction(agent){} - estrutura padrão para funções que serão handlers de intents do bot
	*/

	function BoasVindas(agent) {
		agent.add(`Olá! Sou o Guru e meu objetivo é ajudar a encontrar uma solução para o problema do seu negócio. Vamos começar ?`);
		agent.add(new Suggestion(`Sim`));
		agent.add(new Suggestion(`Não`));
	}
	function BoasVindasNo(agent) {
		agent.add(`Ok. Me avise quando quiser começar.`);
		agent.add(new Suggestion(`Vamos começar`));
	}
	function GetTipo(agent) {
		agent.add(`O que você gostaria de fazer?`);
		agent.add(new Suggestion(`Quero fazer parte`));
		agent.add(new Suggestion(`Quero uma solução`));
	}

	function GetEmpresa(agent) {
		/*
			Constantes que recebem como parametro a comunicação com uma coleção especifica,
			 isso facilita a chamada da coleção em vários lugares do código dentro da function,
			 evitando escrever várias vezes db.collection('coleção especifica')
		*/
		const dbConfig = db.collection('config');
		const dbSegmento = db.collection('segmentos');
		const dbUsers = db.collection('Users');
		const dbProjeto = db.collection('projeto');
		/*
			Constantes que recebem como parametro os valores do parametro da intent
			para pegar o valor do parametro da intent, você deve usar o código agent.parameters.#nome exato do parametro#
		*/
		const [emailUser, nomeUser, telUser, nomeEmpresa, tamanhoEmpresa, Segmento, Problema, Projeto, descDesafio] = [
			agent.parameters.emailUser,
			agent.parameters.nomeUser,
			agent.parameters.telUser,
			agent.parameters.nomeEmpresa,
			agent.parameters.tamanhoEmpresa,
			agent.parameters.Segmento,
			agent.parameters.Problema,
			agent.parameters.Projeto,
			agent.parameters.descDesafio
		];
		let slots = {
			emailUser: emailUser,
			nomeUser: nomeUser,
			telUser: telUser,
			nomeEmpresa: nomeEmpresa,
			tamanhoEmpresa: tamanhoEmpresa,
			Segmento: Segmento,
			Problema: Problema,
			Projeto: Projeto,
			descDesafio: descDesafio
		};
		//Template dos documentos para preenchimento ao longo da conversa da intent, onde recebe os valores passados pelo usuário
		let user = {
			CELULAR: '',
			CIDADE: '',
			EMAIL: '',
			EMPRESA: '',
			ENDERECO: '',
			FONE: '',
			ID_USER: 1,
			IP_ADDRESS: '',
			LINKEDIN: '',
			NAME: '',
			STATUS: 'active',
			USER_AGENT: ''
		};
		let projeto = {
			indice: 1,
			nome: "",
			desafio: [],
			id_mentor: 0,
			id_user: 1,
			interesses: "",
			segmento: "",
			solucao: "",
			status: "em aberto"
		};
		//END
		/*
			o simbolo - ! - representa a condição da váriavel está empty, null ou ""
		*/
		if (!slots.emailUser) {
			agent.add(`Antes de começar, gostaria de pedir algumas de suas informações.`);
			agent.add(`Qual é o seu e-mail?`);
		}
		else if (slots.emailUser && !slots.nomeUser) {
			return dbUsers.where('EMAIL','==',slots.emailUser.toLowerCase()).limit(1).get().then(docs => {
				if(docs.size > 0) {
					//Rotina para verificar cada objeto documento retornado da pesquisa
					docs.forEach(doc => {
						//Constante que conterá os dados do objeto convertidos para leitura e escrita no Dialogflow
						const fields = doc.data();
						agent.add(`Percebi que você já está cadastrado como ${fields.NAME}`);
						agent.add(new Suggestion(`Continuar como ${fields.NAME}`));
					});
				}
				else {
					agent.add(`Qual é o seu nome?`);
				}
				agent.add('');
			});
		}
		else if (slots.nomeUser && !slots.telUser) {
			return dbUsers.where('EMAIL','==',slots.emailUser.toLowerCase()).limit(1).get().then(docs => {
				if(docs.size > 0) {
					docs.forEach(doc => {
						const fields = doc.data();
						agent.add(`Percebi que você já está cadastrado com o número: ${fields.CELULAR}.`);
						agent.add(new Suggestion(`id:${fields.ID_USER} Continuar com ${fields.CELULAR}`));
					});
				}
				else {
					agent.add(`E por último, qual é o seu celular de contato? (e.x: ddd9xxxxxxxx)`);
				}
				agent.add('');
			});
		}
		else if (slots.telUser && !slots.nomeEmpresa) {
			dbUsers.where('EMAIL', '==', slots.emailUser.toLowerCase()).limit(1).get().then(snapshot => {
				if (snapshot == 0) {
					dbConfig.doc('user').get().then(doc => {
						if(doc.exists) {
							const fields = doc.data();
							user.ID_USER = fields.counter + 1;
						}
						user.NAME = slots.nomeUser;
						user.EMAIL = slots.emailUser.toLowerCase();
						user.CELULAR = slots.telUser;
						dbUsers.add(user);
						dbConfig.doc('user').update({ counter: user.ID_USER });
					});
				}
			});
			let id_seek = slots.telUser.split(' ').map(val => val.toLowerCase().trim());
			let id_found = id_seek[0].replace('id:','');
			id_found = parseInt(id_found);
			return dbProjeto.where('id_user','==',id_found).limit(3).get().then(snap => {
				agent.add(`Vamos coletar informações sobre o seu desafio para enviar ao nosso Guru e  nosso Time de Mentores.`);
				agent.add(`Qual o nome da sua empresa/projeto?`);
				if(snap.size > 0) {
					snap.forEach(proj => {
						const campos = proj.data();
						console.log(campos.nome);
						agent.add(new Suggestion(`${campos.nome}`));
					});
				}
			});
		} 
		else if (slots.nomeEmpresa && !slots.tamanhoEmpresa){
			agent.add(`Qual é o tamanho da ${slots.nomeEmpresa}?`);
			agent.add(new Suggestion('startup'));
			agent.add(new Suggestion('pequena'));
			agent.add(new Suggestion('média'));
			agent.add(new Suggestion('grande'));
		}
		else if (slots.tamanhoEmpresa && !slots.Segmento){
			return dbSegmento.limit(6).get().then(snapshot => {
				agent.add(`Selecione um segmento que esteja relacionado ao desafio. Se prefirir, escreva um novo.`);
				if (snapshot.size > 0) {
					snapshot.forEach(doc => {
						const fields = doc.data();
                      agent.add(new Suggestion(`${fields.sinonimos[0]}`));
                    });
				}
				agent.add("");
			});
		}
		else if (slots.Segmento && !slots.Problema) {
			return dbSegmento.where('sinonimos','array-contains', slots.Segmento.toLowerCase()).get().then(snapshot => {
				if(snapshot.size > 0) {
					agent.add('Selecione uma área de interesse que tenha relação com o seu desafio.');
					agent.add('Se for mais de um interesse, escreva-os separando com vírgula.');
					snapshot.forEach(doc => {
						doc.data().interesses.forEach(interesse => {
							agent.add(new Suggestion(`${interesse}`));
						});
					});
				}
				else {
					agent.add('Segmento Novo!!!... Escreva a área de interesse que tenha relação com sua área de atuação');
					agent.add('Caso seja mais de um interesse, escreva-os separando com vírgula.');
					dbSegmento.doc(slots.Segmento.toLowerCase()).set({
						sinonimos: [slots.Segmento.toLowerCase()],
						interesses: []
					});
				}
				agent.add("");
			});
		}
		else if (slots.Problema && !slots.Projeto) {
			let interesses = slots.Problema.split(',').map(val => val.toLowerCase().trim());
			const refSeg = dbSegmento.where('sinonimos','array-contains',slots.Segmento.toLowerCase()).limit(1);
			refSeg.get().then(snap => {
				if (snap.size > 0) {
					snap.forEach(doc => {
						const fields = doc.data();
						interesses.forEach(interesse => {
							if(!fields.interesses.includes(interesse)){
								dbSegmento.doc(fields.sinonimos[0]).update({ interesses: admin.firestore.FieldValue.arrayUnion(interesse) });
							}
						});
					});
				}
			}).catch(err => {
				console.log('--> Error <--');
				console.log(err);
				console.log('--> End Error <--');
				agent.add('');
			});
			return dbProjeto.where('segmento', '==', slots.Segmento.toLowerCase()).where('interesses','array-contains',interesses[0]).limit(3).get().then(projetos => {
				agent.add(`Qual frase melhor descreve seu desafio/problema? Caso não tenha se identificado com nenhuma frase abaixo, escreva o título do seu desafio.`);
				if(projetos.size > 0) {
					projetos.forEach(project => {
						const fields = project.data();
						agent.add(`- ${fields.desafio[0]}`);
					});
					projetos.forEach(project => {
						const fields = project.data();
						agent.add(new Suggestion(`${fields.desafio[0]}`));
					});
				}
			});
		}
		else if (slots.Projeto && !slots.descDesafio) {
			agent.add('Descreva melhor o seu desafio.');
			agent.add('Caso tenha selecionado um titulo. clique em continuar');
			agent.add(new Suggestion('Continuar'));
		}
		else {
			let id_projeto = 0;
			return dbProjeto.where('desafio','array-contains', slots.Projeto.trim()).limit(1).get().then(docs => {
				if (docs.size > 0) {
					agent.add(new Card({
						title: `IDEA`,
						imageUrl: 'https://images.wallpaperscraft.com/image/surface_gray_dark_light_shadow_18440_1920x1080.jpg',
						text: `- Diagnóstico geral do seu negócio\n
						- 3 Dicas do Guru para vencer o seu desafio\n
						- Acesso às soluções já exploradas\n 
						- Acesso limitado aos mentores`,
						buttonText: 'Adquirir - Grátis',
						buttonUrl: 'http://bit.ly/falar-guru'
					}));
					agent.add(new Card({
						title: `STARTER`,
						imageUrl: 'https://wallpaperplay.com/walls/full/6/7/c/189670.jpg',
						text: `- Diagnóstico geral do seu negócio\n
						- 5 Dicas do Guru para vencer o seu desafio\n
						- Acesso às soluções já exploradas\n 
						- 1 solução resolvida por mês\n
						- 5 horas gratuitas com o nosso Time de Mentores`,
						buttonText: 'Adquirir - R$49,90',
						buttonUrl: 'http://bit.ly/falar-guru'
					}));
					agent.add(new Card({
						title: `SMART`,
						imageUrl: 'https://images.squarespace-cdn.com/content/v1/5516199be4b05ede7c57f94f/1488268363050-CHVBOTA490JX1KRFCVN3/ke17ZwdGBToddI8pDm48kKG6OoQUcDwE6Xrn0CktdYIUqsxRUqqbr1mOJYKfIPR7LoDQ9mXPOjoJoqy81S2I8N_N4V1vUb5AoIIIbLZhVYxCRW4BPu10St3TBAUQYVKc7wdBxA2FfWIL_oInLxCuGYBExGLaY8v4Pn7yFeMELUKe4DQXRx1Bu1AnCO9mIfj2/light-blue-wallpaper-7846-8139-hd-wallpapers-1024x576.jpg',
						text: `- Diagnóstico geral do seu negócio\n
						- 5 Dicas do Guru para vencer o seu desafio\n
						- Acesso às soluções já exploradas\n 
						- 4 solução resolvida por mês\n
						- Horas ilimitadas de mentoria com nossos mentores gratuitos`,
						buttonText: 'Adquirir - R$199,90',
						buttonUrl: 'http://bit.ly/falar-guru'
					}));
					docs.forEach(doc => {
						const fields = doc.data();
						id_projeto = fields.indice;
					});
					agent.add(`Após adquirir seu plano, entre em contato com o Guru para receber a solução do projeto de id: ${id_projeto}`);
					agent.add(new Card({
						title: `GURU`,
						imageUrl: 'https://metropolitanafm.com.br/wp-content/uploads/2017/08/whatsapp-logo-hero-690x388.jpg',
						text: `Clique no link abaixo para receber a solução do seu desafio.`,
						buttonText: 'GURU',
						buttonUrl: 'http://bit.ly/falar-guru'
					}));
				}
				else {
					dbUsers.where('EMAIL','==',slots.emailUser).limit(1).get().then(docs => {
						if(docs.size > 0) {
							docs.forEach(doc => {
								const fields = doc.data();
								projeto.id_user = fields.ID_USER;
							});
						}
						dbConfig.doc('projeto').get().then(doc => {
							if(doc.exists) {
								const fields = doc.data();
								projeto.indice = fields.counter + 1;
							}
							projeto.nome = slots.nomeEmpresa;
							projeto.desafio = [ slots.Projeto, slots.descDesafio];
							projeto.interesses = slots.Problema.split(',').map(val => val.toLowerCase().trim());
							projeto.segmento = slots.Segmento.trim().toLowerCase();
							dbProjeto.add(projeto);
							dbConfig.doc('projeto').update({  counter: projeto.indice });
						});
					});
					agent.add(new Card({
						title: `GURU`,
						imageUrl: 'https://metropolitanafm.com.br/wp-content/uploads/2017/08/whatsapp-logo-hero-690x388.jpg',
						text: `Clique no link abaixo para conversar melhor sobre seu desafio.`,
						buttonText: 'GURU',
						buttonUrl: 'http://bit.ly/falar-guru'
					}));
				}
				agent.add(``);
			});
		}
	}

	function GetMentor(agent) {
		const dbConfig = db.collection('config');
		const configUser = dbConfig.doc('user');
		const configProjeto = dbConfig.doc('projeto');
		const dbSegmento = db.collection('segmentos');
		const dbUsers = db.collection('Users');
		const dbMentor = db.collection('mentorValidation');
		const dbProjeto = db.collection('projeto');
		const [emailMentor, nomeMentor, telMentor, segmentoMentor, interesseMentor, tituloDesafio, descDesafio, solucaoDesafio, nomeProjeto, condicoesMentor, precoMentor] = [
			agent.parameters.emailMentor,
			agent.parameters.nomeMentor,
			agent.parameters.telMentor,
			agent.parameters.segmentoMentor,
			agent.parameters.interesseMentor,
			agent.parameters.tituloDesafio,
			agent.parameters.descDesafio,
			agent.parameters.solucaoDesafio,
			agent.parameters.nomeProjeto,
			agent.parameters.condicoesMentor,
			agent.parameters.precoMentor
		];
		let slots = {
			emailMentor: emailMentor,
			nomeMentor: nomeMentor,
			telMentor: telMentor,
			segmentoMentor: segmentoMentor,
			interesseMentor: interesseMentor,
			descDesafio: descDesafio,
			tituloDesafio: tituloDesafio,
			solucaoDesafio: solucaoDesafio,
			nomeProjeto: nomeProjeto,
			condicoesMentor: condicoesMentor,
			precoMentor: precoMentor
		};
		let user = {
			CELULAR: '',
			CIDADE: '',
			EMAIL: '',
			EMPRESA: '',
			ENDERECO: '',
			FONE: '',
			ID_USER: 1,
			IP_ADDRESS: '',
			LINKEDIN: '',
			NAME: '',
			STATUS: 'active',
			USER_AGENT: ''
		};
		let mentor = {
			ID_MENTOR: 1,
			LINKEDIN: '',
			MENTOR_VALIDATION: true,
			KNOWLEDGE_AREA: [],
			KNOWLEDGE_SUBAREA: [],
			MENTOR_BIO: '',
			MENTOR_CRITERIA: '',//
			MENTOR_REFERENCE: '',
			PAGE_REFERER: '',
			REMOTE_HOST: '',
			SEGMENTO: '',
			SITE: '',
			CONDITION: '',
			PRECO: 0.00
		};
		let projeto = {
			indice: 1,
			nome: "",
			desafio: [],
			id_mentor: 1,
			id_user: 1,
			interesses: [],
			segmento: "",
			solucao: "",
			status: "resolvido"
		};

		dbUsers.where('EMAIL', '==', slots.emailMentor.toLowerCase()).limit(1).get().then(docs => {
			if(docs.size > 0) {
				docs.forEach(doc => {
					const fields = doc.data();
					user.ID_USER = fields.ID_USER;
				});
			}	
		});
		
		if (!slots.emailMentor) {
			agent.add(`Antes de começar, gostaria de pedir algumas de suas informações.`);
			agent.add(`Qual é o seu e-mail de contato?`);
		}
		else if (slots.emailMentor && !slots.nomeMentor) {
			return dbUsers.where('EMAIL','==',slots.emailMentor.toLowerCase()).limit(1).get().then(docs => {
				if(docs.size > 0) {
					
					docs.forEach(doc => {
						const fields = doc.data();
						agent.add(`Percebi que você já está cadastrado como ${fields.NAME}`);
						agent.add(new Suggestion(`Continuar como ${fields.NAME}`));
					});
				}
				else {
					agent.add(`Qual é o seu nome?`);
				}
				agent.add('');
			});
		}
		else if (slots.nomeMentor && slots.emailMentor && !slots.telMentor) {
			return dbUsers.where('EMAIL','==',slots.emailMentor.toLowerCase()).limit(1).get().then(docs => {
				if(docs.size > 0) {
					
					docs.forEach(doc => {
						const fields = doc.data();
						agent.add(`Percebi que você já está cadastrado com o número: ${fields.CELULAR}`);
						agent.add(new Suggestion(`Continuar com ${fields.CELULAR}`));
					});
				}
				else {
					agent.add(`E por ultímo, qual é o seu celular de contato? (e.x: ddd9xxxxxxxx)`);
				}
			});
		}
		else if (slots.nomeMentor && slots.emailMentor && slots.telMentor && !slots.segmentoMentor){
			dbUsers.where('EMAIL','==',slots.emailMentor.toLowerCase()).limit(1).get().then(docs => {
				if(docs.size == 0) {
					console.log(`No document found with EMAIL = ${slots.emailMentor.toLowerCase()}`);
					configUser.get().then(documento => {
						if(documento.exists) {
							console.log(`This document exist and was retrieved successfully`);
							const fields = documento.data();
							user.ID_USER = fields.counter + 1;
							console.log(fields);
							console.log(`New user to be add -> id: ${user.ID_USER}`);
						}
						else {
							console.log(`This document doesn't exist`);
						}
						user.NAME = slots.nomeMentor;
						user.EMAIL = slots.emailMentor.toLowerCase();
						user.CELULAR = slots.telMentor;
						console.log(user);
						const trySendUser = dbUsers.add(user);
						console.log(`--- Try Send User Status ---`);
						console.log(trySendUser);
						const trySendConfig = dbConfig.doc('user').update({  counter: user.ID_USER });
						console.log(`--- Try Send Config Status ---`);
						console.log(trySendConfig);
						agent.add('');
					});
				}
				else {
					console.log(`Document found!`);
				}
			});
			return dbSegmento.limit(6).get().then(snapshot => {
				agent.add(`Escreva o segmento que está relacionado a sua área de atuação. Se preferir, adicione um novo.`);
				if (snapshot.size > 0) {
					snapshot.forEach(doc => {
						agent.add(new Suggestion(`${doc.data().sinonimos[0]}`));
					});
				}
				agent.add("");
			});
		}
		else if (slots.nomeMentor && slots.emailMentor && slots.telMentor && slots.segmentoMentor && !slots.interesseMentor){
			let segmento_input = slots.segmentoMentor.trim().toLowerCase();
			return dbSegmento.where('sinonimos','array-contains', segmento_input).get().then(snapshot => {
				if(snapshot.size > 0) {
					agent.add('Selecione a área de interesse que tenha relação com sua área de atuação.');
					agent.add('Caso seja mais de um interesse, escreva-os separando com vírgula.');
					snapshot.forEach(doc => {
						doc.data().interesses.forEach(interesse => {
							agent.add(new Suggestion(`${interesse}`));
						});
					});
				}
				else {
					agent.add('Segmento Novo!!!... Escreva a área de interesse que tenha relação com sua área de atuação');
					agent.add('Caso seja mais de um interesse, escreva-os separando com vírgula.');
					dbSegmento.doc(segmento_input).set({
						sinonimos: [segmento_input],
						interesses: []
					});
				}
				agent.add("");
			});
		}
		else if (slots.nomeMentor && slots.emailMentor && slots.telMentor && slots.segmentoMentor && slots.interesseMentor && !slots.tituloDesafio){
			const interesse_input = slots.interesseMentor.split(',').map(interesse => interesse.trim().toLowerCase());
			let segmento_input = slots.segmentoMentor.trim().toLowerCase();

			return dbSegmento.where('sinonimos', 'array-contains', segmento_input).get().then(snapshot => {
				if (snapshot.size > 0) {
					snapshot.forEach(doc => {
						const campos = doc.data();
						interesse_input.forEach(interesse => {
							//console.log(`TRY INSERT IN ${campos.sinonimos[0]} interesse = ${interesse}`);
							if(!campos.interesses.includes(interesse)) {
								//console.log(`INSERTED -> ${interesse}`);
								const doc_segmentoRef = dbSegmento.doc(campos.sinonimos[0]);
								let arrayUnion = doc_segmentoRef.update({
									interesses: admin.firestore.FieldValue.arrayUnion(interesse)
								});
							}
							/*else {
								console.log(`ALREADY HAS -> ${interesse}`);
							}*/
						});
					});
				}
				agent.add(`Resuma algum desafio que você já solucionou em sua carreira em uma unica frase.`);
			});
		}
		else if (slots.tituloDesafio && !slots.descDesafio) {
			agent.add(`Descreva com detalhe o desafio.`);
		}
		else if (slots.descDesafio && !slots.solucaoDesafio) {
			agent.add(`Qual solução você utilizou para este desafio?`);
		}
		else if (slots.solucaoDesafio && !slots.nomeProjeto) {
            return dbProjeto.where('id_user', '==', user.ID_USER).limit(5).get().then(snapshot => {
                agent.add(`Agora, de um nome a este projeto. Caso seja de um projeto já criado anteriormente, escreva-o exatamente igual da outra vez`);
                if(snapshot.size > 0) {
					snapshot.forEach(proj => {
						const campos = proj.data();
						console.log(campos.nome);
						agent.add(new Suggestion(`${campos.nome}`));
					});
				}
            });
		}
		else if (slots.nomeProjeto && !slots.condicoesMentor) {
			agent.add(`Escolha as condiçõs da sua mentoria:`);
			agent.add(new Suggestion(`Gratuito`));
			agent.add(new Suggestion(`Pago`));
		}
		else if (slots.condicoesMentor && !slots.precoMentor) {
			agent.add('Diga-nos seu preço. Caso tenha escolhido "Gratuito", escreva 0');
		} 
		else {
			const verifyEmail = dbUsers.where('EMAIL', '==', slots.emailMentor.toLowerCase());
			verifyEmail.get().then(snapshot => {
				if (snapshot.size > 0) {
					snapshot.forEach(doc => {
						const user_ = doc.data();
						mentor.ID_MENTOR = user_.ID_USER;
						projeto.id_mentor = user_.ID_USER;
						projeto.id_user = user_.ID_USER;
					});
				}
				dbMentor.where('ID_MENTOR','==',mentor.ID_MENTOR).limit(1).get().then(docs => {
					if(docs.size == 0) {
						mentor.SEGMENTO = slots.segmentoMentor.trim().toLowerCase();
						mentor.KNOWLEDGE_AREA = slots.interesseMentor.split(',').map(interesse => interesse.trim().toLowerCase());
						mentor.CONDITION = slots.condicoesMentor;
						mentor.PRECO = slots.precoMentor;
						dbMentor.add(mentor);
					}
				});
				dbConfig.doc('projeto').get().then(doc => {
					if(doc.exists) {
						const fields = doc.data();
						projeto.indice = fields.counter + 1;
						projeto.desafio = [slots.tituloDesafio.trim(), slots.descDesafio.trim()];
						projeto.interesses = slots.interesseMentor.split(',').map(interesse => interesse.trim().toLowerCase());
						projeto.segmento = slots.segmentoMentor.trim().toLowerCase();
						projeto.solucao = slots.solucaoDesafio.trim();
						projeto.nome = slots.nomeProjeto.trim();
						dbProjeto.add(projeto);
						dbConfig.doc('projeto').update({ counter: projeto.indice });
					}
				});
			});
			agent.add(`Obrigado por fazer parte do nosso team!!!`);
		}
	}

	// Map from Dialogflow intent names to functions to be run when the intent is matched
	let intentMap = new Map();
	intentMap.set('Boas Vindas', BoasVindas);
	intentMap.set('Boas Vindas - no', BoasVindasNo);
	intentMap.set('GetTipo', GetTipo);
	intentMap.set('GetEmpresa', GetEmpresa);
	intentMap.set('GetMentor', GetMentor);
	agent.handleRequest(intentMap);
});
