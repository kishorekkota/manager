import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { CircleProgress } from 'src/components/CircleProgress';
import { useLinodes } from 'src/hooks/useLinodes';
import { useAllImagesQuery } from 'src/queries/images';
import { ApplicationState } from 'src/store';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { getLinode as _getLinode } from 'src/store/linodes/linode.requests';
import { ThunkDispatch } from 'src/store/types';
import { shouldRequestEntity } from 'src/utilities/shouldRequestEntity';
import LinodesDetail from './LinodesDetail';

// @todo delete this file after we react queryify most linode features
// React Query will fetch data when it needs to. A file like this won't be needed

/**
 * We want to hold off loading this screen until Linode data is available.
 * If we have recently requested all Linode data, we're good. If not,
 * we show a loading spinner until the requests are complete.
 */
export const LinodesDetailContainer = () => {
  const { linodes } = useLinodes();
  const dispatch = useDispatch<ThunkDispatch>();

  const params = useParams<{ linodeId: string }>();
  const linodeId = params.linodeId;

  const { isLoading: imagesLoading } = useAllImagesQuery({}, {});

  const { configs, disks } = useSelector((state: ApplicationState) => {
    const disks = state.__resources.linodeDisks[linodeId];
    const configs = state.__resources.linodeConfigs[linodeId];
    return { disks, configs };
  });

  React.useEffect(() => {
    // Unconditionally request data for the Linode being viewed
    dispatch(_getLinode({ linodeId: +linodeId })).catch((_) => null);
  }, [linodeId, dispatch]);

  React.useEffect(() => {
    if (!linodes.itemsById[linodeId]) {
      // Most likely a 404
      return;
    }

    if (configs?.error.read || disks?.error.read) {
      // We don't want an infinite loop.
      return;
    }

    // Make sure we've requested config, disk, and interface information for this Linode
    if (shouldRequestEntity(configs)) {
      dispatch(getAllLinodeConfigs({ linodeId: +linodeId }));
    }

    if (shouldRequestEntity(disks)) {
      dispatch(getAllLinodeDisks({ linodeId: +linodeId }));
    }
  }, [dispatch, configs, disks, linodeId, linodes]);

  if ((linodes.lastUpdated === 0 && linodes.loading) || imagesLoading) {
    return <CircleProgress />;
  }

  return <LinodesDetail />;
};

export default React.memo(LinodesDetailContainer);
