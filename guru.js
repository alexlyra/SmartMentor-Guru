'use strict';
//------------------------------
	const {dialogflow} = require('actions-on-google');
	const functions = require('firebase-functions');
	const admin = require('firebase-admin');

	const { WebhookClient } = require('dialogflow-fulfillment');
	const { Card, Suggestion } = require('dialogflow-fulfillment');
	const { LinkOutSuggestion, OpenUrlAction } = require('actions-on-google'); 

	process.env.DEBUG = 'dialogflow:debug';
	admin.initializeApp(functions.config().firebase);
	//admin.initializeApp({ credential: admin.credential.applicationDefault() });
	const db = admin.firestore();
//------------------------------

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
	const agent = new WebhookClient({request: request, response: response});
	//agent.requestSource = agent.ACTIONS_ON_GOOGLE;

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
		//let conv = agent.conv();
		const dbSegmento = db.collection('segmentos');
		const [nomeEmpresa, tamanhoEmpresa, Segmento, Problema] = [agent.parameters.nomeEmpresa, agent.parameters.tamanhoEmpresa, agent.parameters.Segmento, agent.parameters.Problema];
		let slots = {
			nomeEmpresa: nomeEmpresa,
			tamanhoEmpresa: tamanhoEmpresa,
			Segmento: Segmento,
			Problema: Problema
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

		if (!slots.nomeEmpresa){
			agent.add(`Vamos coletar informações sobre o seu desafio para enviar ao nosso Guru e  nosso Time de Mentores.`);
			agent.add(`Qual o nome da sua empresa?`);
		}
		else if (slots.nomeEmpresa && !slots.tamanhoEmpresa){
			agent.add(`Qual é o tamanho da ${slots.nomeEmpresa}?`);
			agent.add(new Suggestion('pequena'));
			agent.add(new Suggestion('média'));
			agent.add(new Suggestion('grande'));
			agent.add(new Suggestion('startup'));
		}
		else if (slots.nomeEmpresa && slots.tamanhoEmpresa && !slots.Segmento){
			return dbSegmento.limit(4).get().then(snapshot => {
				agent.add(`Selecione um segmento que esteja relacionado ao desafio. Se prefirir, escreva um novo.`);
				if (snapshot.size > 0) {
					snapshot.forEach(doc => {
                      agent.add(new Suggestion(`${doc.data().sinonimos[0]}`));
                    });
				}
				agent.add("");
			});
		}
		else if (slots.nomeEmpresa && slots.tamanhoEmpresa && slots.Segmento && !slots.Problema) {
			return dbSegmento.where('sinonimos','array-contains', slots.Segmento).get().then(snapshot => {
				agent.add('Selecione uma área de interesse que tenha relação com o seu desafio.');
				agent.add('Se for mais de um interesse, escreva-os separando com vírgula.');
				if(snapshot.size > 0) {
					snapshot.forEach(doc => {
						doc.data().interesses.forEach(interesse => {
							agent.add(new Suggestion(`${interesse}`));
						});
					});
				}
				else {
					dbSegmento.doc(slots.Segmento).set({
						sinonimos: [slots.Segmento],
						interesses: []
					});
				}
				agent.add("");
			});
		} 
		else {
			let inter = slots.Problema;
			if (inter.search(",") >= 0) {
				inter = slots.Problema.split(',').map(val => { return val.toLowerCase().trim(); });
			} else {
				inter = slots.Problema.toLowerCase().trim();
			}

			const doc_segmentoRef = dbSegmento.doc(slots.Segmento);

			return doc_segmentoRef.get().then(doc => {
				const campos = doc.data();
				if (typeof inter == "string") {
					if(!campos.interesses.includes(inter)){
						let arrUnion = doc_segmentoRef.update({
							interesses: admin.firestore.FieldValue.arrayUnion(inter)
						});
					}
				}
				else {
					inter.forEach(interesse => {
						if(!campos.interesses.includes(interesse)){
							let arrUnion = doc_segmentoRef.update({
								interesses: admin.firestore.FieldValue.arrayUnion(interesse)
							});
						}
					});
				}
				agent.add(new Card({
					title: `GURU`,
					text: `Interessante, Clique no link abaixo para conversar melhor sobre seu desafio.`,
					buttonText: 'GURU',
					buttonUrl: 'http://bit.ly/falar-guru'
				}));
          		agent.add(``);
			});
		}
	}

	function GetMentor(agent) {
		//let conv = agent.conv();
		const dbSegmento = db.collection('segmentos');
		const dbUsers = db.collection('Users');
		const dbMentor = db.collection('mentorValidation');
		const dbProjeto = db.collection('projeto');
		const [nomeMentor, emailMentor, telMentor, segmentoMentor, interesseMentor, tituloDesafio, descDesafio, solucaoDesafio, condicoesMentor] = [
			agent.parameters.nomeMentor,
			agent.parameters.emailMentor,
			agent.parameters.telMentor,
			agent.parameters.segmentoMentor,
			agent.parameters.interesseMentor,
			agent.parameters.tituloDesafio,
			agent.parameters.descDesafio,
			agent.parameters.solucaoDesafio,
			agent.parameters.condicoesMentor
		];
		let slots = {
			nomeMentor: nomeMentor,
			emailMentor: emailMentor,
			telMentor: telMentor,
			segmentoMentor: segmentoMentor,
			interesseMentor: interesseMentor,
			descDesafio: descDesafio,
			tituloDesafio: tituloDesafio,
			solucaoDesafio: solucaoDesafio,
			condicoesMentor: condicoesMentor
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
			CONDITION: ''
		};
		let projeto = {
			nome: "",
			desafio: [],
			id_mentor: 1,
			id_user: 0,
			interesses: "",
			segmento: "",
			solucao: "",
			status: "resolvido"
		};

		if (!slots.nomeMentor) {
			agent.add(`Antes de começar, gostaria de pedir algumas de suas informações.`);
			agent.add(`Qual é o seu nome?`);
		}
		else if (slots.nomeMentor && !slots.emailMentor) {
			agent.add(`Qual é o seu e-mail de contato?`);
		}
		else if (slots.nomeMentor && slots.emailMentor && !slots.telMentor) {
			agent.add(`E por ultímo, qual é o seu celular de contato? (e.x: ddd9xxxxxxxx)`);
		}
		else if (slots.nomeMentor && slots.emailMentor && slots.telMentor && !slots.segmentoMentor){
			dbUsers.get().then(snapshot => {
				if(snapshot.size > 0) {
					user.ID_USER = snapshot.size + 1;
				}
				user.NAME = slots.nomeMentor;
				user.EMAIL = slots.emailMentor;
				user.CELULAR = slots.telMentor;
				dbUsers.add(user);
				//console.log("---	ADD USER IN DATABASE	---");
				//console.log(user);
			});
			return dbSegmento.limit(4).get().then(snapshot => {
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
				agent.add('Selecione a área de interesse que tenha relação com sua área de atuação.');
				agent.add('Caso seja mais de um interesse, escreva-os separando com vírgula.');
				if(snapshot.size > 0) {
					snapshot.forEach(doc => {
						doc.data().interesses.forEach(interesse => {
							agent.add(new Suggestion(`${interesse}`));
						});
					});
				}
				else {
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
							console.log(`TRY INSERT IN ${campos.sinonimos[0]} interesse = ${interesse}`);
							if(!campos.interesses.includes(interesse)) {
								console.log(`INSERTED -> ${interesse}`);
								const doc_segmentoRef = dbSegmento.doc(campos.sinonimos[0]);
								let arrayUnion = doc_segmentoRef.update({
									interesses: admin.firestore.FieldValue.arrayUnion(interesse)
								});
							}
							else {
								console.log(`ALREADY HAS -> ${interesse}`);
							}
						});
					});
				}
				agent.add(`Resuma algum desafio que você já solucionou em sua carreira em uma unica frase.`);
			});
		}
		else if (slots.tituloDesafio && !slots.descDesafio) {
			agent.add(`Descreva com detalhe o desafio.`);
		}
		else if (slots.descDesafio && slots.solucaoDesafio) {
			agent.add(`Qual solução você utilizou para este desafio?`);
		}
		else if (slots.segmentoMentor && slots.interesseMentor && slots.descDesafio && !slots.condicoesMentor) {
			agent.add(`Escolha as condiçõs da sua mentoria:`);
			agent.add(new Suggestion(`Gratuito`));
			agent.add(new Suggestion(`Pago`));
		} 
		else {
			dbUsers.where('EMAIL','==',slots.emailMentor).get().then(snapshot => {
				console.log(`EMAIL == ${slots.emailMentor} ->`);
				let id_get;
				if (snapshot.size > 0) {
					snapshot.forEach(doc => {
						const user_ = doc.data();
						mentor.ID_MENTOR = user_.ID_USER;
						projeto.id_mentor = user_.ID_USER;
						console.log("Entrou no snapshot => doc");
						console.log("Pegou usuário:::");
						console.log(user_);
						console.log(`ID DO USER: ${user_.ID_USER} E ID DO MENTOR: ${mentor.ID_MENTOR}`);
					});
				}
				else {
					console.log("Não conseguiu encontrar snapshots");
				}
				mentor.SEGMENTO = slots.segmentoMentor.trim().toLowerCase();
				mentor.KNOWLEDGE_AREA = slots.interesseMentor.split(',').map(interesse => interesse.trim().toLowerCase());
				mentor.CONDITION = slots.condicoesMentor;
				dbMentor.add(mentor);
				projeto.desafio = [slots.tituloDesafio, slots.descDesafio];
				projeto.interesses = slots.interesseMentor;
				projeto.segmento = slots.segmentoMentor.trim().toLowerCase();
				projeto.solucao = slots.solucaoDesafio;
				dbProjeto.add(projeto);

				console.log("Mentor adicionado: --->");
				console.log(mentor);
				console.log("Projeto adicionado: --->");
				console.log(projeto);
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