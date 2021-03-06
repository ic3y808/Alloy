﻿using System;
using Android.App;
using Android.Content;
using Android.Graphics;
using Android.Graphics.Drawables;
using Android.OS;
using Android.Runtime;
using Android.Support.V4.Content;
using Android.Util;
using Android.Views;
using Android.Widget;
using Java.Lang;
using Math = System.Math;
using Uri = Android.Net.Uri;

namespace Alloy.Widgets
{
	public class CircleImageView : ImageView
	{
		private static readonly ScaleType SCALE_TYPE = ScaleType.CenterCrop;

		private static readonly Bitmap.Config BITMAP_CONFIG = Bitmap.Config.Argb8888;
		private static int COLORDRAWABLE_DIMENSION = 2;
		private static readonly Color DEFAULT_BORDER_COLOR = Color.Black;
		private static readonly Color DEFAULT_CIRCLE_BACKGROUND_COLOR = Color.Transparent;

		private readonly RectF mDrawableRect = new RectF();
		private readonly RectF mBorderRect = new RectF();

		private readonly Matrix mShaderMatrix = new Matrix();
		private readonly Paint mBitmapPaint = new Paint();
		private readonly Paint mBorderPaint = new Paint();
		private readonly Paint mCircleBackgroundPaint = new Paint();

		private Color mBorderColor = DEFAULT_BORDER_COLOR;
		private int mBorderWidth;
		private Color mCircleBackgroundColor = DEFAULT_CIRCLE_BACKGROUND_COLOR;

		private Bitmap mBitmap;
		private BitmapShader mBitmapShader;
		private int mBitmapWidth;
		private int mBitmapHeight;

		private float mDrawableRadius;
		private float mBorderRadius;

		private ColorFilter mColorFilter;

		private bool mReady;
		private bool mSetupPending;
		private bool mBorderOverlay;
		private bool mDisableCircularTransformation;

		protected CircleImageView(IntPtr javaReference, JniHandleOwnership transfer) : base(javaReference, transfer)
		{
		}

		public CircleImageView(Context context) : this(context, null)
		{

		}

		public CircleImageView(Context context, IAttributeSet attrs) : this(context, attrs, 0)
		{
		}

		public CircleImageView(Context context, IAttributeSet attrs, int defStyleAttr) : this(context, attrs, defStyleAttr, 0)
		{
		}

		public CircleImageView(Context context, IAttributeSet attrs, int defStyleAttr, int defStyleRes) : base(context, attrs, defStyleAttr, defStyleRes)
		{
			Init();
		}

		private void Init()
		{
			base.SetScaleType(SCALE_TYPE);
			mReady = true;

			if (Build.VERSION.SdkInt >= BuildVersionCodes.Lollipop)
			{
				OutlineProvider = new CustomOutlineProvider(this);
			}

			if (mSetupPending)
			{
				Setup();
				mSetupPending = false;
			}
		}

		public override ScaleType GetScaleType()
		{
			return SCALE_TYPE;
		}

		public override void SetScaleType(ScaleType scaleType)
		{
			if (scaleType != SCALE_TYPE)
			{
				throw new IllegalArgumentException($"ScaleType {scaleType} not supported.");
			}
		}

		public override void SetAdjustViewBounds(bool adjustViewBounds)
		{
			if (adjustViewBounds)
			{
				throw new IllegalArgumentException("adjustViewBounds not supported.");
			}
		}

		public override void SetColorFilter(ColorFilter cf)
		{
			if (cf == mColorFilter)
			{
				return;
			}

			mColorFilter = cf;
			ApplyColorFilter();
			Invalidate();
		}

		public override void SetImageBitmap(Bitmap bm)
		{
			base.SetImageBitmap(bm);
			InitializeBitmap();
		}

		public override void SetImageDrawable(Drawable drawable)
		{
			base.SetImageDrawable(drawable);
			InitializeBitmap();
		}

		public override void SetImageResource(int resId)
		{
			base.SetImageResource(resId);
			InitializeBitmap();
		}

		public override void SetImageURI(Uri uri)
		{
			base.SetImageURI(uri);
			InitializeBitmap();
		}

		public override ColorFilter ColorFilter => mColorFilter;
		protected override void OnDraw(Canvas canvas)
		{
			if (mDisableCircularTransformation)
			{
				base.OnDraw(canvas);
				return;
			}

			if (mBitmap == null)
			{
				return;
			}

			if (mCircleBackgroundColor != Color.Transparent)
			{
				canvas.DrawCircle(mDrawableRect.CenterX(), mDrawableRect.CenterY(), mDrawableRadius, mCircleBackgroundPaint);
			}
			canvas.DrawCircle(mDrawableRect.CenterX(), mDrawableRect.CenterY(), mDrawableRadius, mBitmapPaint);
			if (mBorderWidth > 0)
			{
				canvas.DrawCircle(mBorderRect.CenterX(), mBorderRect.CenterY(), mBorderRadius, mBorderPaint);
			}
		}

		protected override void OnSizeChanged(int w, int h, int oldw, int oldh)
		{
			base.OnSizeChanged(w, h, oldw, oldh);
			Setup();
		}

		public override bool OnTouchEvent(MotionEvent e)
		{
			return inTouchableArea(e.GetX(), e.GetY()) && base.OnTouchEvent(e);
		}

		private bool inTouchableArea(float x, float y)
		{
			return Math.Pow(x - mBorderRect.CenterX(), 2) + Math.Pow(y - mBorderRect.CenterY(), 2) <= Math.Pow(mBorderRadius, 2);
		}

		public override void SetPadding(int left, int top, int right, int bottom)
		{
			base.SetPadding(left, top, right, bottom);
			Setup();
		}

		public override void SetPaddingRelative(int start, int top, int end, int bottom)
		{
			base.SetPaddingRelative(start, top, end, bottom);
			Setup();
		}

		public int getBorderColor()
		{
			return mBorderColor;
		}

		public void setBorderColor(Color borderColor)
		{
			if (borderColor == mBorderColor)
			{
				return;
			}

			mBorderColor = borderColor;
			mBorderPaint.Color = mBorderColor;
			Invalidate();
		}

		public int GetCircleBackgroundColor()
		{
			return mCircleBackgroundColor;
		}

		public void SetCircleBackgroundColor(Color circleBackgroundColor)
		{
			if (circleBackgroundColor == mCircleBackgroundColor)
			{
				return;
			}

			mCircleBackgroundColor = circleBackgroundColor;
			mCircleBackgroundPaint.Color = circleBackgroundColor;
			Invalidate();
		}

		public void SetCircleBackgroundColorResource(int circleBackgroundRes)
		{
			SetCircleBackgroundColor(new Color(ContextCompat.GetColor(Application.Context, circleBackgroundRes)));
		}

		public int GetBorderWidth()
		{
			return mBorderWidth;
		}

		public void SetBorderWidth(int borderWidth)
		{
			if (borderWidth == mBorderWidth)
			{
				return;
			}

			mBorderWidth = borderWidth;
			Setup();
		}

		public bool IsBorderOverlay()
		{
			return mBorderOverlay;
		}

		public void SetBorderOverlay(bool borderOverlay)
		{
			if (borderOverlay == mBorderOverlay)
			{
				return;
			}

			mBorderOverlay = borderOverlay;
			Setup();
		}

		public bool IsDisableCircularTransformation()
		{
			return mDisableCircularTransformation;
		}

		public void SetDisableCircularTransformation(bool disableCircularTransformation)
		{
			if (mDisableCircularTransformation == disableCircularTransformation)
			{
				return;
			}

			mDisableCircularTransformation = disableCircularTransformation;
			InitializeBitmap();
		}

		private void ApplyColorFilter()
		{
			mBitmapPaint.SetColorFilter(mColorFilter);
		}

		private Bitmap GetBitmapFromDrawable(Drawable drawable)
		{
			if (drawable == null) return null;
			BitmapDrawable bitmapDrawable = drawable as BitmapDrawable;
			if (bitmapDrawable != null)
			{
				return bitmapDrawable.Bitmap;
			}
			try
			{
				Bitmap bitmap = drawable is ColorDrawable ? Bitmap.CreateBitmap(COLORDRAWABLE_DIMENSION, COLORDRAWABLE_DIMENSION, BITMAP_CONFIG) : Bitmap.CreateBitmap(drawable.IntrinsicWidth, drawable.IntrinsicHeight, BITMAP_CONFIG);

				Canvas canvas = new Canvas(bitmap);
				drawable.SetBounds(0, 0, canvas.Width, canvas.Height);
				drawable.Draw(canvas);
				return bitmap;
			}
			catch (Java.Lang.Exception e)
			{
				e.PrintStackTrace();
				return null;
			}
		}

		private void InitializeBitmap()
		{
			mBitmap = mDisableCircularTransformation ? null : GetBitmapFromDrawable(Drawable);
			Setup();
		}

		private void Setup()
		{
			if (!mReady)
			{
				mSetupPending = true;
				return;
			}

			if (Width == 0 && Height == 0)
			{
				return;
			}

			if (mBitmap == null)
			{
				Invalidate();
				return;
			}

			mBitmapShader = new BitmapShader(mBitmap, Shader.TileMode.Clamp, Shader.TileMode.Clamp);

			mBitmapPaint.AntiAlias = true;
			mBitmapPaint.SetShader(mBitmapShader);

			mBorderPaint.SetStyle(Paint.Style.Stroke);
			mBorderPaint.AntiAlias = true;
			mBorderPaint.Color = mBorderColor;
			mBorderPaint.StrokeWidth = mBorderWidth;

			mCircleBackgroundPaint.SetStyle(Paint.Style.Fill);
			mCircleBackgroundPaint.AntiAlias = true;
			mCircleBackgroundPaint.Color = mCircleBackgroundColor;

			mBitmapHeight = mBitmap.Height;
			mBitmapWidth = mBitmap.Width;

			mBorderRect.Set(CalculateBounds());
			mBorderRadius = Math.Min((mBorderRect.Height() - mBorderWidth) / 2.0f, (mBorderRect.Width() - mBorderWidth) / 2.0f);

			mDrawableRect.Set(mBorderRect);
			if (!mBorderOverlay && mBorderWidth > 0)
			{
				mDrawableRect.Inset(mBorderWidth - 1.0f, mBorderWidth - 1.0f);
			}
			mDrawableRadius = Math.Min(mDrawableRect.Height() / 2.0f, mDrawableRect.Width() / 2.0f);

			ApplyColorFilter();
			UpdateShaderMatrix();
			Invalidate();
		}

		private RectF CalculateBounds()
		{
			int availableWidth = Width - PaddingLeft - PaddingRight;
			int availableHeight = Height - PaddingTop - PaddingBottom;

			int sideLength = Math.Min(availableWidth, availableHeight);

			float left = PaddingLeft + (availableWidth - sideLength) / 2f;
			float top = PaddingTop + (availableHeight - sideLength) / 2f;

			return new RectF(left, top, left + sideLength, top + sideLength);
		}

		private void UpdateShaderMatrix()
		{
			float scale;
			float dx = 0;
			float dy = 0;

			mShaderMatrix.Set(null);

			if (mBitmapWidth * mDrawableRect.Height() > mDrawableRect.Width() * mBitmapHeight)
			{
				scale = mDrawableRect.Height() / mBitmapHeight;
				dx = (mDrawableRect.Width() - mBitmapWidth * scale) * 0.5f;
			}
			else
			{
				scale = mDrawableRect.Width() / mBitmapWidth;
				dy = (mDrawableRect.Height() - mBitmapHeight * scale) * 0.5f;
			}

			mShaderMatrix.SetScale(scale, scale);
			mShaderMatrix.PostTranslate((int)(dx + 0.5f) + mDrawableRect.Left, (int)(dy + 0.5f) + mDrawableRect.Top);

			mBitmapShader.SetLocalMatrix(mShaderMatrix);
		}

		private class CustomOutlineProvider : ViewOutlineProvider
		{
			private readonly CircleImageView owner;
			public CustomOutlineProvider(CircleImageView owner)
			{
				this.owner = owner;
			}
			public override void GetOutline(View view, Outline outline)
			{
				Rect bounds = new Rect();
				owner.mBorderRect.RoundOut(bounds);
				outline.SetRoundRect(bounds, bounds.Width() / 2.0f);
			}
		}

	}
}