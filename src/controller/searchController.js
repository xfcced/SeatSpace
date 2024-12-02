const prisma = require('../service/prismaClient')
const dayjs = require('dayjs')

async function search(req, res) {
	const searchContent = req.query.search_content
	const page = parseInt(req.query.page) || 1

	const queryResult = await querySearchResults(searchContent, page)

	const resData = queryResult.map((item) => {
		if (item.type === 'show') {
			return {
				itemType: item.type,
				data: {
					showId: item.show_id,
					showName: item.show_name,
					hall: item.theater_name + item.hall_name,
					startTime: dayjs(item.start_time).format('YYYY-MM-DD HH:mm'),
					rating: item.current_rating,
					imgUrl: item.path,
				},
			}
		}

		return {
			itemType: item.type,
			data: {
				theaterId: item.theater_id,
				name: item.theater_name,
				description: item.theater_description,
				imgUrl: item.path,
			},
		}
	})

	res.send(resData)
}

async function querySearchResults(content, page) {
	const pageSize = 10
	const offset = pageSize * (page - 1)

	/**
	 * Fuzzy search for show and theater names
	 * use queryRaw because the query logic is too complex for prisma
	 */
	const queryResult =
		await prisma.$queryRaw`select * from ( select 'show' as type, ss.show_id, ss.show_name, ss.start_time, ss.rank, h.name as hall_name, t.name as theater_name, r.current_rating, i.path, null as theater_id, null as theater_description from ( select s.id as show_id, s.name as show_name, s.start_time, s.hall_id, s.theater_id, ts_rank( to_tsvector('english', s.name), to_tsquery('english', ${content}) ) as rank from show s where to_tsvector('english', s.name) @@ to_tsquery('english', ${content}) ) as ss left join hall h on ss.hall_id = h.id left join theater t on ss.theater_id = t.id left join rating r on ss.show_id = r.object_id and r.object_type = 'show' left join image i on ss.show_id = i.object_id and i.object_type = 'show' union select 'theater' as type, null as show_id, null as show_name, null as start_time, tt.rank, null as hall_name, tt.name as theater_name, null as current_rating, i.path, tt.id as theater_id, tt.description as theater_description from ( select *, ts_rank( to_tsvector('english', t.name), to_tsquery('english', ${content}) ) as rank from theater t where to_tsvector('english', t.name) @@ to_tsquery('english', ${content}) ) as tt left join image i on tt.id = i.object_id and i.object_type = 'theater') as res order by res.rank desc limit 10 offset ${offset};`

	return queryResult
}

module.exports = {
	search,
}
