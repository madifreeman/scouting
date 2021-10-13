export default async function me(req, res) {
  switch (req.method) {
    case "POST":
      const { offset, pageSize } = req.body;
      
      // buld route 
      let route = 'https://api.airtable.com/v0/appQUfrKBBc89xFrC/Startups?view=All%20Startups';
      route = route + '&fields%5B%5D=Name&fields%5B%5D=Website'; // specify fields to fetch
      if (offset) route = route + '&offset=' + offset; // specify page offset
      if (pageSize) route = route + '&pageSize=' + pageSize; // specify page size

      // request
      try {
        const result = await fetch(
          route,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, // TODO: Use env variable
            },
          }
        ).then((r) => r.json());
        
        // format results
        const startups = result.records.map((r) => {
          return { name: r.fields["Name"], url: r.fields["Website"] };
        });
        res.status(200).json({ startups, offset: result.offset });
      } catch (error) {
        res.status(error.status || 500).end(error.message);
      }
      break;
    default:
      res.status(405).json({
        message: `The ${req.method} request method is not allowed on this route.`,
      });
      break;
  }
}
