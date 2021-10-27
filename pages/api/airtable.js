import { airtableClient } from "/lib/airtableClient";

export default async function me(req, res) {
  switch (req.method) {
    case "POST": // get page of startups
      const { offset, pageSize } = req.body;
      // buld route
      let route =
        "https://api.airtable.com/v0/app6qfrezm4DQ9D3A/Startups?view=All%20Startups";
      route =
        route +
        "&fields%5B%5D=Name&fields%5B%5D=Website&fields%5B%5D=City&fields%5B%5D=Country"; // fields to fetch
      route =
        route +
        "&filterByFormula=AND(Rating%20%3D%20BLANK()%2C%20Junk%20%3D%20BLANK())"; // filter out startups which have already been rated or marked as junk
      if (offset) route = route + "&offset=" + offset; // specify page offset
      if (pageSize) route = route + "&pageSize=" + pageSize; // specify page size

      // request
      try {
        const result = await fetch(route, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, // TODO: Use env variable
          },
        }).then((r) => r.json());
        
        // format results
        const startups = result.records.map((r) => {
          return {
            name: r.fields["Name"],
            url: r.fields["Website"],
            id: r.id,
            city: r.fields["City"],
            country: [r.fields["Country"]],
          };
        });
        
        // return response
        res.status(200).json({ startups, offset: result.offset });
      } catch (error) {
        res.status(error.status || 500).end(error.message);
      }
      break;

    case "PATCH": // update startup with rating
      try {
        const { startupId, rating, isJunk } = req.body;
        console.log({rating});
        
        const r = airtableClient("Startups").update([
          {
            id: startupId,
            fields: {
              Rating: rating,
              Junk: isJunk
            },
          },
        ]);
        res.status(200).json(r);
      } catch (error) {
        console.log(error);
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
