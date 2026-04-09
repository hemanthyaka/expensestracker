'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type Category } from '@/lib/hooks/useCategories'
import { Input }   from '@/components/ui/Input'
import { Button }  from '@/components/ui/Button'
import { Card }    from '@/components/ui/Card'
import { Dialog }  from '@/components/ui/Dialog'

const ICON_OPTIONS = [
  'utensils','car','home','tv','heart-pulse','shopping-bag',
  'more-horizontal','coffee','plane','zap','music','book',
  'dumbbell','gamepad-2','briefcase','gift','bus','pizza',
]
const COLOR_OPTIONS = [
  '#8b5cf6','#10b981','#6366f1','#ec4899','#f59e0b',
  '#3b82f6','#6b7280','#f43f5e','#06b6d4','#84cc16','#fb923c','#a855f7',
]

type FormState = { name: string; color: string; icon: string }
const EMPTY: FormState = { name: '', color: '#8b5cf6', icon: 'utensils' }

function CatFormDialog({ open, onOpenChange, initial, onSubmit, isPending, title }: {
  open: boolean; onOpenChange: (o: boolean) => void; initial: FormState
  onSubmit: (f: FormState) => void; isPending: boolean; title: string
}) {
  const [form, setForm] = useState<FormState>(initial)
  // reset on open
  useState(() => { setForm(initial) })

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex flex-col gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Groceries" />

        <div>
          <p className="text-[10px] font-bold text-ink-3 uppercase tracking-widest font-display mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })}
                className="w-7 h-7 rounded-full transition-all"
                style={{ backgroundColor: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px', transform: form.color === c ? 'scale(1.15)' : 'scale(1)' }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-ink-3 uppercase tracking-widest font-display mb-2">Icon</p>
          <div className="flex gap-1.5 flex-wrap">
            {ICON_OPTIONS.map((ic) => {
              const name = ic.split('-').map((s: string) => s[0].toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons
              const Icon = (LucideIcons[name] ?? LucideIcons.Circle) as React.ElementType
              return (
                <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
                  style={{
                    borderColor:     form.icon === ic ? form.color : '#1c1c30',
                    backgroundColor: form.icon === ic ? `${form.color}22` : 'transparent',
                    color:           form.icon === ic ? form.color : '#3d4460',
                  }}>
                  <Icon size={15} />
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={isPending || !form.name.trim()}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export function CategoryManager() {
  const { data: categories = [], isLoading } = useCategories()
  const create  = useCreateCategory()
  const update  = useUpdateCategory()
  const del     = useDeleteCategory()
  const [showCreate, setShowCreate] = useState(false)
  const [editCat,    setEditCat]    = useState<Category | null>(null)
  const [deleteCat,  setDeleteCat]  = useState<Category | null>(null)

  function CatIcon({ cat }: { cat: Category }) {
    const name = cat.icon.split('-').map((s: string) => s[0].toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons
    const Icon = (LucideIcons[name] ?? LucideIcons.Circle) as React.ElementType
    return <Icon size={15} style={{ color: cat.color }} />
  }

  return (
    <Card>
      <div className="flex items-center justify-between px-5 py-4 border-b border-rim">
        <div>
          <p className="text-sm font-semibold font-display text-ink tracking-tight">Categories</p>
          <p className="text-xs text-ink-3 font-sans mt-0.5">Manage your expense categories</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={13} /> Add Category</Button>
      </div>

      <div className="divide-y divide-rim/30">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-groove/50" /><div className="flex-1 h-3 bg-groove/50 rounded w-24" />
          </div>
        )) : categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#0e0e1c] transition-colors">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}18` }}>
              <CatIcon cat={cat} />
            </div>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
            <p className="text-sm font-medium text-ink flex-1 font-sans">{cat.name}</p>
            <div className="flex gap-1.5">
              <button onClick={() => setEditCat(cat)} className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-ink hover:bg-canvas transition-colors"><Pencil size={11} /></button>
              <button onClick={() => setDeleteCat(cat)} className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-rose hover:border-rose/30 transition-colors"><Trash2 size={11} /></button>
            </div>
          </div>
        ))}
      </div>

      <CatFormDialog open={showCreate} onOpenChange={setShowCreate} initial={EMPTY} isPending={create.isPending} title="New Category"
        onSubmit={async (f) => { await create.mutateAsync(f); setShowCreate(false) }} />

      {editCat && (
        <CatFormDialog open={!!editCat} onOpenChange={(o) => { if (!o) setEditCat(null) }}
          initial={{ name: editCat.name, color: editCat.color, icon: editCat.icon }} isPending={update.isPending} title="Edit Category"
          onSubmit={async (f) => { await update.mutateAsync({ id: editCat.id, ...f }); setEditCat(null) }} />
      )}

      <Dialog open={!!deleteCat} onOpenChange={(o) => { if (!o) setDeleteCat(null) }} title="Delete Category">
        <p className="text-sm text-ink-2 font-sans mb-5">
          Delete <span className="text-ink font-medium">&quot;{deleteCat?.name}&quot;</span>? This will fail if any expenses use this category.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteCat(null)}>Cancel</Button>
          <Button variant="danger" onClick={async () => { if (deleteCat) { await del.mutateAsync(deleteCat.id); setDeleteCat(null) } }} disabled={del.isPending}>
            {del.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </Card>
  )
}
