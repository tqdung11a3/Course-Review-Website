import { useRef } from "react";
import { CheckboxGroup } from "../courses/form/CheckboxGroup";
import { FormField } from "../courses/form/FormField";
import {
  MATERIAL_TYPE_OPTIONS,
  RECOMMENDATION_OPTIONS,
  SOURCE_OPTIONS,
  SUITABLE_FOR_OPTIONS,
  USAGE_PURPOSE_OPTIONS,
} from "../../utils/reviewFormConstants";

function MaterialRatingSlider({ label, value, onChange }) {
  return (
    <div className="material-rating-slider">
      <div className="material-rating-slider-head">
        <span>{label}</span>
        <span className="rating-slider-value">{value}/5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rating-slider"
      />
    </div>
  );
}

export function MaterialForm({ material, errors, onChange, onSave, onCancel }) {
  const fileRef = useRef(null);

  function update(patch) {
    onChange({ ...material, ...patch });
  }

  function updateRating(key, value) {
    onChange({
      ...material,
      ratings: { ...material.ratings, [key]: value },
    });
  }

  function handleFiles(event) {
    const files = Array.from(event.target.files || []).filter((f) => f.size <= 10 * 1024 * 1024);
    update({ localFiles: [...(material.localFiles || []), ...files] });
    event.target.value = "";
  }

  function removeLocalFile(index) {
    update({
      localFiles: material.localFiles.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="material-form-panel">
      <h4 className="material-form-panel-title">Thêm tài liệu mới</h4>

      <FormField label="Tên tài liệu" required error={errors.title}>
        <input
          className="form-control"
          placeholder="VD: Slide bài giảng Python"
          value={material.title}
          onChange={(e) => update({ title: e.target.value })}
        />
      </FormField>

      <div className="form-row">
        <FormField label="Loại tài liệu" required error={errors.materialType}>
          <select
            className="form-control"
            value={material.materialType}
            onChange={(e) => update({ materialType: e.target.value })}
          >
            <option value="">Chọn loại</option>
            {MATERIAL_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Nguồn tài liệu" required error={errors.source}>
          <select
            className="form-control"
            value={material.source}
            onChange={(e) => update({ source: e.target.value })}
          >
            <option value="">Chọn nguồn</option>
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="form-row">
        <FormField label="Tác giả / Đơn vị">
          <input
            className="form-control"
            placeholder="VD: TS. Nguyễn Văn A"
            value={material.authorOrPublisher}
            onChange={(e) => update({ authorOrPublisher: e.target.value })}
          />
        </FormField>

        <FormField label="Phiên bản / Năm">
          <input
            className="form-control"
            placeholder="VD: 2024, v2.0"
            value={material.versionOrYear}
            onChange={(e) => update({ versionOrYear: e.target.value })}
          />
        </FormField>
      </div>

      <FormField label="Link tài liệu">
        <input
          className="form-control"
          type="url"
          placeholder="https://..."
          value={material.linkUrl}
          onChange={(e) => update({ linkUrl: e.target.value })}
        />
      </FormField>

      <FormField label="Hoặc tải file lên">
        <div
          className="syllabus-dropzone syllabus-dropzone--compact"
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <p className="syllabus-dropzone-title">Tải lên tài liệu</p>
          <p className="syllabus-dropzone-hint">PDF, DOC, PNG, JPG (tối đa 10MB)</p>
          <input ref={fileRef} type="file" multiple hidden onChange={handleFiles} />
        </div>
        {material.localFiles?.length > 0 && (
          <ul className="syllabus-file-list">
            {material.localFiles.map((f, i) => (
              <li key={`${f.name}-${i}`}>
                <span>{f.name}</span>
                <button type="button" onClick={() => removeLocalFile(i)}>
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}
      </FormField>

      <div className="material-ratings-grid">
        <MaterialRatingSlider
          label="Mức độ hữu ích"
          value={material.ratings.usefulness}
          onChange={(v) => updateRating("usefulness", v)}
        />
        <MaterialRatingSlider
          label="Mức độ dễ hiểu"
          value={material.ratings.readability}
          onChange={(v) => updateRating("readability", v)}
        />
        <MaterialRatingSlider
          label="Mức độ bám sát môn học"
          value={material.ratings.courseRelevance}
          onChange={(v) => updateRating("courseRelevance", v)}
        />
        <MaterialRatingSlider
          label="Mức độ cần thiết"
          value={material.ratings.necessity}
          onChange={(v) => updateRating("necessity", v)}
        />
      </div>

      <FormField label="Phù hợp để:">
        <CheckboxGroup
          options={USAGE_PURPOSE_OPTIONS}
          values={material.usagePurposes}
          onChange={(v) => update({ usagePurposes: v })}
          columns={2}
        />
      </FormField>

      <FormField label="Phù hợp với:">
        <CheckboxGroup
          options={SUITABLE_FOR_OPTIONS}
          values={material.suitableFor}
          onChange={(v) => update({ suitableFor: v })}
          columns={2}
        />
      </FormField>

      <FormField label="Tài liệu này có nội dung gì">
        <textarea
          className="form-control form-textarea"
          rows={3}
          placeholder="Mô tả ngắn gọn nội dung chính của tài liệu..."
          value={material.contentSummary}
          onChange={(e) => update({ contentSummary: e.target.value })}
        />
      </FormField>

      <FormField label="Điểm mạnh">
        <textarea
          className="form-control form-textarea"
          rows={3}
          placeholder="Những điểm mạnh của tài liệu này..."
          value={material.strengths}
          onChange={(e) => update({ strengths: e.target.value })}
        />
      </FormField>

      <FormField label="Hạn chế / Lưu ý">
        <textarea
          className="form-control form-textarea"
          rows={3}
          placeholder="Những hạn chế hoặc lưu ý khi dùng tài liệu..."
          value={material.limitations}
          onChange={(e) => update({ limitations: e.target.value })}
        />
      </FormField>

      <FormField label="Cách dùng hiệu quả">
        <textarea
          className="form-control form-textarea"
          rows={3}
          placeholder="Chia sẻ cách sử dụng tài liệu này để đạt hiệu quả tốt nhất..."
          value={material.effectiveUsageGuide}
          onChange={(e) => update({ effectiveUsageGuide: e.target.value })}
        />
      </FormField>

      <FormField label="Mức độ khuyến nghị">
        <div className="recommendation-options">
          {RECOMMENDATION_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`recommendation-option ${
                material.recommendationLevel === opt.value ? "recommendation-option--active" : ""
              }`}
            >
              <input
                type="radio"
                name="recommendationLevel"
                value={opt.value}
                checked={material.recommendationLevel === opt.value}
                onChange={() => update({ recommendationLevel: opt.value })}
              />
              <span className="recommendation-option-icon">{opt.icon}</span>
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </FormField>

      <div className="material-draft-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Hủy
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          Lưu tài liệu
        </button>
      </div>
    </div>
  );
}
