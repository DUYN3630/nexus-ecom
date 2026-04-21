import { useBulkAction } from '../../hooks/useBulkAction';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useToast } from "../../contexts/ToastContext";
import { Trash, EyeSlash } from '@phosphor-icons/react';
import marketingApi from '../../api/marketingApi';

const BulkActionBar = () => {
  const { selectedItems, clearSelection, isVisible } = useBulkAction();
  const { showConfirmDialog } = useConfirmDialog();
  const { addToast } = useToast();

  const bulkHide = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Xác nhận Tạm ẩn',
      message: `Bạn có chắc chắn muốn tạm ẩn ${selectedItems.length} banner đã chọn không?`,
      type: 'warning',
    });

    if (confirmed) {
      try {
        const res = await marketingApi.updateBannersStatus(selectedItems, 'inactive');
        if (res.success) {
          addToast(`Đã tạm ẩn thành công ${selectedItems.length} banner.`, 'success');
          clearSelection();
          window.dispatchEvent(new Event('refreshBanners'));
        } else {
          addToast('Lỗi khi tạm ẩn banner.', 'error');
        }
      } catch (err) {
        addToast('Lỗi khi thao tác.', 'error');
      }
    } else {
      addToast('Thao tác tạm ẩn đã bị hủy.', 'info');
    }
  };

  const bulkDelete = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Xác nhận Xóa hàng loạt',
      message: `Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${selectedItems.length} banner đã chọn không? Thao tác này không thể hoàn tác!`,
      type: 'error',
    });

    if (confirmed) {
      try {
        const res = await marketingApi.deleteBanners(selectedItems);
        if (res.success) {
          addToast(`Đã xóa thành công ${selectedItems.length} banner.`, 'success');
          clearSelection();
          window.dispatchEvent(new Event('refreshBanners'));
        } else {
          addToast('Lỗi khi xóa banner.', 'error');
        }
      } catch (err) {
        addToast('Lỗi khi thao tác.', 'error');
      }
    } else {
      addToast('Thao tác xóa đã bị hủy.', 'info');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div id="bulkActionBar" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] bulk-bar-animate">
      <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 border border-slate-700">
        <div className="flex items-center gap-2 border-r border-slate-700 pr-6">
          <span className="bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black" id="selectedCount">{selectedItems.length}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Đã chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={bulkHide} className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <EyeSlash className="w-4 h-4" /> Tạm ẩn
          </button>
          <button onClick={bulkDelete} className="px-4 py-2 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <Trash className="w-4 h-4" /> Xóa hàng loạt
          </button>
          <button onClick={clearSelection} className="px-4 py-2 text-slate-500 hover:text-white text-xs font-bold transition-all underline underline-offset-4">
            Hủy chọn
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
