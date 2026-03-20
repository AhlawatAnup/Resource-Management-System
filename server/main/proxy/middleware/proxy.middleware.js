exports.requireProxyTarget = async (req, res, next) => {
	// // SET ALL MACHINE :: USER EALTED PARAMS IN SESSIONS
	// // DO NOT MAKE QUERY SEARCH

	// let urlMigid = req.params.migid;
	// console.log(urlMigid);
	// // if (urlMigid == "login" || urlMigid == "lab") {
	// //   urlMigid = undefined;
	// // }

	// if (urlMigid) {
	// 	try {
	// 		console.log("####### DB hit");
	// 		const machine = await getMachineByMigid(urlMigid);
	// 		req.session.currentMachineMigid = urlMigid;
	// 		req.session.proxyTarget = `http://${machine.ip}:${machine.port}`;
	// 		return req.session.save((err) => {
	// 			if (err) return next(err);
	// 			next();
	// 		});
	// 	} catch (err) {
	// 		console.log(err);
	// 		return res.status(404).send("Machine not found.");
	// 	}
	// }

	if (!req.session?.proxyTarget) {
		// return res.sendFile(path.join(publicPath, "home", "home.html"));
		// return res.status(401).json({ error: "No active session. Please launch a machine from the dashboard." });
        return res.redirect("/home");
	}

	next();
};