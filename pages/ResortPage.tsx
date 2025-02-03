'use client'

import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { fetchResortDetails } from '../utils/api'
import CrowdingBadge from '../components/resort/CrowdingBadge'
import BaseCamView from '../components/resort/BaseCamView'
import CrowdingTrend from '../components/resort/CrowdingTrend'
import Loading from '../components/shared/Loading'

export default function ResortPage() {
  const { id } = useParams<{ id: string }>()
  const { data: resort, isLoading, error } = useQuery(['resort', id], () => fetchResortDetails(id))

  if (isLoading) return <Loading />
  if (error) return <div>Error fetching resort details</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{resort?.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <CrowdingBadge level={resort?.current_crowding} />
          <BaseCamView url={resort?.base_cam_url} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">24-Hour Crowding Trend</h2>
          <CrowdingTrend data={resort?.crowding_history} />
        </div>
      </div>
    </div>
  )
}

